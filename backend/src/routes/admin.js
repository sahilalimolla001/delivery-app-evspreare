import express from "express";
import { query } from "../db.js";
import { auditLog } from "../services/auditService.js";

export const adminRouter = express.Router();

adminRouter.get("/admin/dashboard", async (_req, res) => {
  const [orders, riders, revenue] = await Promise.all([
    query("SELECT status, count(*)::int FROM orders GROUP BY status"),
    query("SELECT online_status, approval_status, count(*)::int FROM riders GROUP BY online_status, approval_status"),
    query("SELECT COALESCE(sum(total_payout), 0)::numeric AS revenue FROM orders WHERE status = 'DELIVERED'"),
  ]);
  res.json({ orders: orders.rows, riders: riders.rows, revenue: revenue.rows[0].revenue });
});

adminRouter.get("/admin/riders", async (req, res) => {
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

adminRouter.post("/admin/riders/:id/approve", async (req, res) => {
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

adminRouter.post("/admin/riders/:id/suspend", async (req, res) => {
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
