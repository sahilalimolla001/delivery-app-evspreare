import express from "express";
import { query } from "../db.js";

export const adminRouter = express.Router();

adminRouter.get("/admin/dashboard", async (_req, res) => {
  const [orders, riders, revenue] = await Promise.all([
    query("SELECT status, count(*)::int FROM orders GROUP BY status"),
    query("SELECT online_status, approval_status, count(*)::int FROM riders GROUP BY online_status, approval_status"),
    query("SELECT COALESCE(sum(total_payout), 0)::numeric AS revenue FROM orders WHERE status = 'DELIVERED'"),
  ]);
  res.json({ orders: orders.rows, riders: riders.rows, revenue: revenue.rows[0].revenue });
});

adminRouter.post("/admin/riders/:id/approve", async (req, res) => {
  const { rows } = await query("UPDATE riders SET approval_status = 'APPROVED' WHERE id = $1 RETURNING *", [req.params.id]);
  res.json({ rider: rows[0] });
});

adminRouter.post("/admin/riders/:id/suspend", async (req, res) => {
  const { rows } = await query("UPDATE riders SET approval_status = 'SUSPENDED', online_status = false WHERE id = $1 RETURNING *", [req.params.id]);
  res.json({ rider: rows[0] });
});
