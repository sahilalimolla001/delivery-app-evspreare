import express from "express";
import Joi from "joi";
import { query } from "../db.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../services/auditService.js";
import { assignNextPendingOrderToRider, dispatchOrderToRider } from "../services/orderAssignmentService.js";

export const ordersRouter = express.Router();

ordersRouter.get("/orders", async (req, res) => {
  const { rows } = await query(
    `SELECT o.*, s.name AS store_name, s.address AS store_address,
            s.latitude AS store_latitude, s.longitude AS store_longitude,
            c.name AS customer_name, c.phone AS customer_phone, c.address AS customer_address,
            c.latitude AS customer_latitude, c.longitude AS customer_longitude
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     JOIN customers c ON c.id = o.customer_id
     JOIN riders r ON r.id = o.rider_id
     WHERE r.user_id = $1
     ORDER BY o.created_at DESC
     LIMIT 100`,
    [req.auth.sub],
  );
  res.json({ orders: rows });
});

ordersRouter.post("/accept-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  if (!rider?.online_status) return res.status(409).json({ error: "RIDER_OFFLINE" });
  const { rows } = await query(
    `UPDATE orders
     SET status = 'GOING_TO_STORE', updated_at = now()
     WHERE id = $1
       AND rider_id = $2
       AND status = 'ASSIGNED'
     RETURNING *`,
    [req.body.orderId, rider.id],
  );
  const order = rows[0];
  if (!order) return res.status(409).json({ error: "ORDER_NOT_AVAILABLE" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "ORDER_ACCEPTED",
    entityType: "ORDER",
    entityId: req.body.orderId,
    requestId: req.requestId,
  });
  res.json({ order });
});

ordersRouter.post("/reject-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  reason: Joi.string().max(180).optional(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  const { rows } = await query(
    `UPDATE orders
     SET rider_id = NULL, status = 'PENDING', assigned_at = NULL, updated_at = now()
     WHERE id = $1
       AND rider_id = $2
       AND status = 'ASSIGNED'
     RETURNING *`,
    [req.body.orderId, rider.id],
  );
  if (!rows[0]) return res.status(409).json({ error: "ORDER_NOT_AVAILABLE" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "ORDER_REJECTED",
    entityType: "ORDER",
    entityId: req.body.orderId,
    metadata: { reason: req.body.reason || null },
    requestId: req.requestId,
  });
  const nextDispatch = await dispatchOrderToRider(rows[0]);
  res.json({
    message: "ORDER_PASSED_TO_NEXT_RIDER",
    order: rows[0],
    reassigned: nextDispatch.assigned,
    nextRiderId: nextDispatch.riderId,
  });
});

ordersRouter.post("/pickup-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  const { rows } = await query(
    `UPDATE orders SET status = 'PICKED_UP', picked_up_at = now(), updated_at = now()
     WHERE id = $1
       AND rider_id = $2
       AND status IN ('ARRIVED_STORE', 'GOING_TO_STORE', 'ASSIGNED')
     RETURNING *`,
    [req.body.orderId, rider.id],
  );
  if (!rows[0]) return res.status(409).json({ error: "ORDER_NOT_AVAILABLE" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "ORDER_PICKED_UP",
    entityType: "ORDER",
    entityId: req.body.orderId,
    metadata: { latitude: req.body.latitude, longitude: req.body.longitude },
    requestId: req.requestId,
  });
  res.json({ order: rows[0] });
});

ordersRouter.post("/deliver-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  const { rows } = await query(
    `UPDATE orders SET status = 'DELIVERED', delivered_at = now(), updated_at = now()
     WHERE id = $1
       AND rider_id = $2
       AND status IN ('ARRIVED_CUSTOMER', 'GOING_TO_CUSTOMER', 'PICKED_UP', 'GOING_TO_STORE')
     RETURNING *`,
    [req.body.orderId, rider.id],
  );
  if (!rows[0]) return res.status(409).json({ error: "ORDER_NOT_AVAILABLE" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "ORDER_DELIVERED",
    entityType: "ORDER",
    entityId: req.body.orderId,
    metadata: { latitude: req.body.latitude, longitude: req.body.longitude },
    requestId: req.requestId,
  });
  const nextOrder = rider.online_status ? await assignNextPendingOrderToRider(rider.id) : null;
  res.json({ order: rows[0], otpVerified: true, nextOrder });
});

async function getRider(userId) {
  const { rows } = await query("SELECT * FROM riders WHERE user_id = $1", [userId]);
  return rows[0];
}
