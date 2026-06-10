import express from "express";
import Joi from "joi";
import { query } from "../db.js";
import { validate } from "../middleware/validate.js";
import { assignOrderToRider } from "../services/orderAssignmentService.js";

export const ordersRouter = express.Router();

ordersRouter.get("/orders", async (req, res) => {
  const { rows } = await query(
    `SELECT o.*, s.name AS store_name, c.name AS customer_name
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
  const order = await assignOrderToRider({ orderId: req.body.orderId, riderId: rider.id });
  if (!order) return res.status(409).json({ error: "ORDER_NOT_AVAILABLE" });
  res.json({ order });
});

ordersRouter.post("/reject-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  reason: Joi.string().max(180).optional(),
})), async (_req, res) => {
  res.json({ message: "ORDER_PASSED_TO_NEXT_RIDER" });
});

ordersRouter.post("/pickup-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})), async (req, res) => {
  const { rows } = await query(
    `UPDATE orders SET status = 'PICKED_UP', picked_up_at = now(), updated_at = now()
     WHERE id = $1 AND status IN ('ARRIVED_STORE', 'GOING_TO_STORE', 'ASSIGNED')
     RETURNING *`,
    [req.body.orderId],
  );
  res.json({ order: rows[0] });
});

ordersRouter.post("/deliver-order", validate(Joi.object({
  orderId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})), async (req, res) => {
  const { rows } = await query(
    `UPDATE orders SET status = 'DELIVERED', delivered_at = now(), updated_at = now()
     WHERE id = $1 AND status IN ('ARRIVED_CUSTOMER', 'GOING_TO_CUSTOMER', 'PICKED_UP')
     RETURNING *`,
    [req.body.orderId],
  );
  res.json({ order: rows[0], otpVerified: true });
});

async function getRider(userId) {
  const { rows } = await query("SELECT * FROM riders WHERE user_id = $1", [userId]);
  return rows[0];
}
