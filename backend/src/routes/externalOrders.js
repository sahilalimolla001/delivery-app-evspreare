import express from "express";
import { config } from "../config.js";
import { query } from "../db.js";
import { dispatchOrderToRider } from "../services/orderAssignmentService.js";

export const externalOrdersRouter = express.Router();

function requireExternalOrderKey(req, res, next) {
  const supplied = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : req.headers["x-external-order-key"];
  if (!config.externalOrderApiKey || supplied !== config.externalOrderApiKey) {
    return res.status(401).json({ error: "EXTERNAL_ORDER_AUTH_REQUIRED" });
  }
  return next();
}

function requireWarehouseConfig(req, res, next) {
  const supplied = req.headers["x-admin-key"];
  if (config.adminApiKey && supplied !== config.adminApiKey) {
    return res.status(401).json({ error: "ADMIN_AUTH_REQUIRED" });
  }
  if (!config.warehouse.apiUrl || !config.warehouse.integrationApiKey) {
    return res.status(503).json({ error: "WAREHOUSE_SYNC_NOT_CONFIGURED" });
  }
  return next();
}

function text(value, fallback = "") {
  return String(value || fallback || "").trim();
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function addressText(payload) {
  const shipping = payload.shipping_address || payload.shippingAddress || {};
  return text(
    payload.customer_address
      || payload.customerAddress
      || shipping.address
      || [shipping.address_1, shipping.address_2, shipping.city, shipping.state, shipping.pincode].filter(Boolean).join(", "),
  );
}

function customerPhone(payload) {
  const shipping = payload.shipping_address || payload.shippingAddress || {};
  return text(payload.customer_phone || payload.customerPhone || shipping.phone);
}

function customerName(payload) {
  const shipping = payload.shipping_address || payload.shippingAddress || {};
  return text(
    payload.customer_name
      || payload.customerName
      || [shipping.first_name, shipping.last_name].filter(Boolean).join(" "),
    "Customer",
  );
}

function warehouseInfo(payload) {
  const warehouse = payload.warehouse || payload.pickup || {};
  return {
    code: text(warehouse.code || warehouse.id || payload.warehouse_code || payload.warehouseId, "WAREHOUSE"),
    name: text(warehouse.name || payload.warehouse_name, "Warehouse"),
    phone: text(warehouse.phone || payload.warehouse_phone),
    address: text(warehouse.address || payload.warehouse_address, "Warehouse pickup location"),
    latitude: warehouse.latitude ?? payload.warehouse_latitude ?? null,
    longitude: warehouse.longitude ?? payload.warehouse_longitude ?? null,
  };
}

function paymentInfo(payload) {
  const payment = payload.payment || {};
  const amounts = payload.amounts || {};
  const method = text(payload.payment_method || payload.paymentMethod || payment.method, "unknown");
  const normalizedMethod = method.toLowerCase() === "cod" ? "COD" : method;
  return {
    method: normalizedMethod,
    status: text(payload.payment_status || payload.paymentStatus || payment.status),
    collectAmount: normalizedMethod === "COD"
      ? number(payload.cod_amount ?? payload.codAmount ?? payment.collectAmount ?? amounts.total ?? payload.total_amount)
      : 0,
    total: number(amounts.total ?? payload.total_amount ?? payload.amountTotal),
  };
}

function deliveryInfo(payload) {
  const delivery = payload.delivery || {};
  const mode = text(payload.delivery_mode || payload.deliveryMode || delivery.mode || payload.priority, "standard").toLowerCase();
  return {
    mode,
    label: text(delivery.label || payload.delivery_label, mode === "fast" ? "Fast delivery" : "Standard delivery"),
    eta: text(delivery.estimatedDays || payload.delivery_eta),
  };
}

function normalizeOrderPayload(input) {
  const payload = input.order || input;
  const externalOrderId = text(payload.external_order_id || payload.externalOrderId || payload.id || payload.order_id);
  const orderNumber = text(payload.order_number || payload.orderNumber || externalOrderId);
  const source = text(payload.source || payload.external_source || "warehouse");
  const warehouse = warehouseInfo(payload);
  const payment = paymentInfo(payload);
  const delivery = deliveryInfo(payload);
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    source,
    externalOrderId,
    orderNumber,
    customer: {
      name: customerName(payload),
      phone: customerPhone(payload),
      address: addressText(payload),
      latitude: payload.customer_latitude ?? payload.customerLatitude ?? null,
      longitude: payload.customer_longitude ?? payload.customerLongitude ?? null,
    },
    warehouse,
    payment,
    delivery,
    items: items.map((item) => ({
      name: text(item.name || item.product_name || item.sku || item.product_id, "Item"),
      quantity: Math.max(1, Number.parseInt(item.quantity || 1, 10)),
      unit: text(item.unit || "pcs"),
      imageUrl: text(item.image_url || item.imageUrl),
    })),
    raw: payload,
  };
}

async function importWarehouseOrder(rawPayload) {
  const order = normalizeOrderPayload(rawPayload);
  if (!order.externalOrderId) throw new Error("EXTERNAL_ORDER_ID_REQUIRED");
  if (!order.customer.name) throw new Error("CUSTOMER_NAME_REQUIRED");

  const { rows: stores } = await query(
    `INSERT INTO stores (name, phone, address, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (name) DO UPDATE
     SET phone = COALESCE(EXCLUDED.phone, stores.phone),
         address = EXCLUDED.address,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude
     RETURNING id`,
    [order.warehouse.name, order.warehouse.phone || null, order.warehouse.address, order.warehouse.latitude, order.warehouse.longitude],
  );

  const { rows: customers } = await query(
    `INSERT INTO customers (name, phone, address, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [order.customer.name, order.customer.phone || "", order.customer.address || "", order.customer.latitude, order.customer.longitude],
  );

  const totalPayout = order.payment.total || 0;
  const { rows: orders } = await query(
    `INSERT INTO orders (
       public_id, customer_id, store_id, status, total_payout,
       external_source, external_order_id, payment_method, payment_status,
       payment_collect_amount, delivery_mode, source_payload
     )
     VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (external_source, external_order_id) DO UPDATE
     SET payment_method = EXCLUDED.payment_method,
         payment_status = EXCLUDED.payment_status,
         payment_collect_amount = EXCLUDED.payment_collect_amount,
         delivery_mode = EXCLUDED.delivery_mode,
         source_payload = EXCLUDED.source_payload,
         updated_at = now()
     RETURNING *`,
    [
      order.orderNumber,
      customers[0].id,
      stores[0].id,
      totalPayout,
      order.source,
      order.externalOrderId,
      order.payment.method,
      order.payment.status,
      order.payment.collectAmount,
      order.delivery.mode,
      JSON.stringify(order.raw),
    ],
  );

  await query("DELETE FROM order_items WHERE order_id = $1", [orders[0].id]);
  for (const item of order.items) {
    await query(
      `INSERT INTO order_items (order_id, name, quantity, unit, image_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [orders[0].id, item.name, item.quantity, item.unit, item.imageUrl || null],
    );
  }

  return orders[0];
}

externalOrdersRouter.post("/external/warehouse/orders", requireExternalOrderKey, async (req, res) => {
  try {
    const order = await importWarehouseOrder(req.body);
    const dispatch = await dispatchOrderToRider(order);
    res.status(201).json({ ok: true, order: dispatch.order, dispatched: dispatch.assigned, riderId: dispatch.riderId });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

externalOrdersRouter.post("/external/warehouse/sync", requireWarehouseConfig, async (req, res) => {
  const url = new URL("/api/integrations/delivery-orders", config.warehouse.apiUrl);
  url.searchParams.set("delivery", req.query.delivery || "all");
  url.searchParams.set("statuses", req.query.statuses || "all");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.warehouse.integrationApiKey}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return res.status(response.status).json(data);

  const imported = [];
  const dispatched = [];
  for (const warehouseOrder of data.orders || []) {
    const order = await importWarehouseOrder(warehouseOrder);
    const dispatch = await dispatchOrderToRider(order);
    imported.push(dispatch.order);
    if (dispatch.assigned) dispatched.push(dispatch.order.id);
  }
  res.json({ ok: true, imported: imported.length, dispatched: dispatched.length, orders: imported });
});
