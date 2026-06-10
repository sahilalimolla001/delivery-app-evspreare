import express from "express";
import { query } from "../db.js";

export const profileRouter = express.Router();

profileRouter.get("/profile", async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.phone, u.email, r.id AS rider_id, r.rider_code, r.rating,
            r.online_status, r.vehicle_number, r.approval_status
     FROM users u
     LEFT JOIN riders r ON r.user_id = u.id
     WHERE u.id = $1`,
    [req.auth.sub],
  );
  res.json(rows[0] || null);
});
