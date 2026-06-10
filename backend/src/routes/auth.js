import express from "express";
import Joi from "joi";
import { query } from "../db.js";
import { signToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOtp, verifyOtp } from "../services/otpService.js";

export const authRouter = express.Router();

authRouter.post("/send-otp", validate(Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
})), async (req, res) => {
  const otp = await createOtp(req.body.phone);
  res.json({
    message: "OTP_SENT",
    devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
  });
});

authRouter.post("/verify-otp", validate(Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
  otp: Joi.string().length(6).required(),
})), async (req, res) => {
  const ok = await verifyOtp(req.body.phone, req.body.otp);
  if (!ok) return res.status(401).json({ error: "INVALID_OTP" });

  const { rows } = await query(
    `INSERT INTO users (phone)
     VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET updated_at = now()
     RETURNING id, phone, name, email`,
    [req.body.phone],
  );
  const user = rows[0];
  const token = signToken({ sub: user.id, phone: user.phone });
  return res.json({ token, user });
});
