import express from "express";
import Joi from "joi";
import { query } from "../db.js";
import { validate } from "../middleware/validate.js";
import { assignNextPendingOrderToRider } from "../services/orderAssignmentService.js";

export const riderRouter = express.Router();

riderRouter.post("/online", validate(Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  if (!rider) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  await query("UPDATE riders SET online_status = true, last_seen_at = now() WHERE id = $1", [rider.id]);
  await query(
    "INSERT INTO locations (rider_id, latitude, longitude) VALUES ($1, $2, $3)",
    [rider.id, req.body.latitude, req.body.longitude],
  );
  const assignedOrder = rider.approval_status === "APPROVED"
    ? await assignNextPendingOrderToRider(rider.id)
    : null;
  res.json({ online: true, assignedOrder });
});

riderRouter.post("/offline", async (req, res) => {
  const rider = await getRider(req.auth.sub);
  if (!rider) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  await query("UPDATE riders SET online_status = false, last_seen_at = now() WHERE id = $1", [rider.id]);
  res.json({ online: false });
});

async function getRider(userId) {
  const { rows } = await query("SELECT * FROM riders WHERE user_id = $1", [userId]);
  return rows[0];
}
