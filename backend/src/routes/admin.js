import express from "express";
import { query } from "../db.js";
import { auditLog } from "../services/auditService.js";
import { syncWarehouseOrders } from "./externalOrders.js";

export const adminRouter = express.Router();

adminRouter.get("/dashboard", async (_req, res) => {
  const [orders, riders, revenue, users, documents, tickets, earnings] = await Promise.all([
    query("SELECT status, count(*)::int FROM orders GROUP BY status"),
    query("SELECT online_status, approval_status, count(*)::int FROM riders GROUP BY online_status, approval_status"),
    query("SELECT COALESCE(sum(total_payout), 0)::numeric AS revenue FROM orders WHERE status = 'DELIVERED'"),
    query("SELECT count(*)::int FROM users"),
    query("SELECT status, count(*)::int FROM documents GROUP BY status"),
    query("SELECT status, count(*)::int FROM support_tickets GROUP BY status"),
    query("SELECT COALESCE(sum(total), 0)::numeric AS total FROM earnings"),
  ]);
  res.json({
    orders: orders.rows,
    riders: riders.rows,
    revenue: revenue.rows[0].revenue,
    users: users.rows[0].count,
    documents: documents.rows,
    tickets: tickets.rows,
    earnings: earnings.rows[0].total,
  });
});

adminRouter.get("/riders", async (req, res) => {
  const status = req.query.status;
  const params = [];
  const filters = [];

  if (status === "online") {
    filters.push("r.online_status = true");
  } else if (status === "pending") {
    filters.push("r.approval_status = 'PENDING'");
  } else if (status === "approved") {
    filters.push("r.approval_status = 'APPROVED'");
  } else if (status === "suspended") {
    filters.push("r.approval_status = 'SUSPENDED'");
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT r.id, r.rider_code, r.vehicle_number, r.online_status, r.approval_status,
            r.rating, r.acceptance_rate, r.last_seen_at, r.created_at,
            u.name, u.phone, u.email
     FROM riders r
     JOIN users u ON u.id = r.user_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT 500`,
    params,
  );
  res.json({ riders: rows });
});

adminRouter.get("/orders", async (_req, res) => {
  const { rows } = await query(
    `SELECT o.id, o.public_id, o.status, o.total_payout, o.assigned_at, o.delivered_at, o.created_at,
            o.external_source, o.external_order_id, o.payment_method, o.payment_status,
            o.payment_collect_amount, o.delivery_mode,
            s.name AS store_name, s.address AS store_address,
            c.name AS customer_name, c.phone AS customer_phone, c.address AS customer_address,
            u.name AS rider_name, u.phone AS rider_phone
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN riders r ON r.id = o.rider_id
     LEFT JOIN users u ON u.id = r.user_id
     ORDER BY o.created_at DESC
     LIMIT 500`,
  );
  res.json({ orders: rows });
});

adminRouter.post("/warehouse/sync", async (req, res) => {
  try {
    const result = await syncWarehouseOrders({
      delivery: req.query.delivery,
      statuses: req.query.statuses,
    });
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      error: error.message,
      details: error.details || null,
    });
  }
});

adminRouter.get("/earnings", async (_req, res) => {
  const { rows } = await query(
    `SELECT e.id, e.total, e.base_pay, e.distance_pay, e.surge, e.bonus, e.tips, e.created_at,
            o.public_id AS order_public_id, u.name AS rider_name, u.phone AS rider_phone
     FROM earnings e
     JOIN riders r ON r.id = e.rider_id
     JOIN users u ON u.id = r.user_id
     LEFT JOIN orders o ON o.id = e.order_id
     ORDER BY e.created_at DESC
     LIMIT 500`,
  );
  res.json({ earnings: rows });
});

adminRouter.get("/documents", async (_req, res) => {
  const { rows } = await query(
    `SELECT d.id, d.type, d.file_url, d.status, d.expires_at, d.created_at,
            u.name AS rider_name, u.phone AS rider_phone
     FROM documents d
     JOIN riders r ON r.id = d.rider_id
     JOIN users u ON u.id = r.user_id
     ORDER BY d.created_at DESC
     LIMIT 500`,
  );
  res.json({ documents: rows });
});

adminRouter.post("/documents/:id/approve", async (req, res) => {
  const { rows } = await query("UPDATE documents SET status = 'APPROVED', reviewed_at = now() WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "DOCUMENT_NOT_FOUND" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "DOCUMENT_APPROVED",
    entityType: "DOCUMENT",
    entityId: req.params.id,
    requestId: req.requestId,
  });
  res.json({ document: rows[0] });
});

adminRouter.post("/documents/:id/reject", async (req, res) => {
  const { rows } = await query("UPDATE documents SET status = 'REJECTED', reviewed_at = now() WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "DOCUMENT_NOT_FOUND" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "DOCUMENT_REJECTED",
    entityType: "DOCUMENT",
    entityId: req.params.id,
    requestId: req.requestId,
  });
  res.json({ document: rows[0] });
});

adminRouter.get("/support", async (_req, res) => {
  const { rows } = await query(
    `SELECT t.id, t.title, t.description, t.status, t.priority, t.created_at, t.updated_at,
            u.name AS rider_name, u.phone AS rider_phone
     FROM support_tickets t
     JOIN riders r ON r.id = t.rider_id
     JOIN users u ON u.id = r.user_id
     ORDER BY t.created_at DESC
     LIMIT 500`,
  );
  res.json({ tickets: rows });
});

adminRouter.post("/support/:id/resolve", async (req, res) => {
  const { rows } = await query("UPDATE support_tickets SET status = 'RESOLVED', updated_at = now() WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "TICKET_NOT_FOUND" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "SUPPORT_TICKET_RESOLVED",
    entityType: "SUPPORT_TICKET",
    entityId: req.params.id,
    requestId: req.requestId,
  });
  res.json({ ticket: rows[0] });
});

adminRouter.post("/riders/:id/approve", async (req, res) => {
  const { rows } = await query("UPDATE riders SET approval_status = 'APPROVED' WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "RIDER_APPROVED",
    entityType: "RIDER",
    entityId: req.params.id,
    requestId: req.requestId,
  });
  res.json({ rider: rows[0] });
});

adminRouter.post("/riders/:id/suspend", async (req, res) => {
  const { rows } = await query("UPDATE riders SET approval_status = 'SUSPENDED', online_status = false WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  await auditLog({
    actorUserId: req.auth.sub,
    action: "RIDER_SUSPENDED",
    entityType: "RIDER",
    entityId: req.params.id,
    requestId: req.requestId,
  });
  res.json({ rider: rows[0] });
});
