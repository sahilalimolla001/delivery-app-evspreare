import express from "express";
import Joi from "joi";
import { query } from "../db.js";
import { validate } from "../middleware/validate.js";

export const supportRouter = express.Router();

supportRouter.post("/support-ticket", validate(Joi.object({
  title: Joi.string().min(3).max(180).required(),
  description: Joi.string().allow("").max(2000).optional(),
  priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "SOS").default("NORMAL"),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  if (!rider) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  const { rows } = await query(
    `INSERT INTO support_tickets (rider_id, title, description, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [rider.id, req.body.title, req.body.description || "", req.body.priority],
  );
  res.status(201).json({ ticket: rows[0] });
});

supportRouter.post("/sos", validate(Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  orderId: Joi.string().uuid().optional(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  const { rows } = await query(
    `INSERT INTO support_tickets (rider_id, title, description, priority)
     VALUES ($1, 'Emergency SOS', $2, 'SOS')
     RETURNING *`,
    [rider.id, `Live location: ${req.body.latitude}, ${req.body.longitude}`],
  );
  res.status(201).json({ ticket: rows[0], callSupport: true });
});

async function getRider(userId) {
  const { rows } = await query("SELECT * FROM riders WHERE user_id = $1", [userId]);
  return rows[0];
}
