import express from "express";
import Joi from "joi";
import rateLimit from "express-rate-limit";
import { query } from "../db.js";
import { signToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { normalizePhone, sendOtp, verifyOtp } from "../services/otpService.js";

export const authRouter = express.Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "OTP_RATE_LIMITED" },
});

authRouter.post("/send-otp", otpLimiter, validate(Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
})), async (req, res) => {
  try {
    const result = await sendOtp(req.body.phone);
    res.json({
      message: "OTP_SENT",
      provider: result.provider,
      channel: result.channel,
      devOtp: process.env.NODE_ENV === "production" ? undefined : result.devOtp,
    });
  } catch (error) {
    if (error.message === "TWILIO_VERIFY_NOT_CONFIGURED") {
      return res.status(503).json({ error: "OTP_PROVIDER_NOT_CONFIGURED" });
    }
    console.error("send_otp_failed", error);
    return res.status(502).json({ error: "OTP_DELIVERY_FAILED" });
  }
});

authRouter.post("/verify-otp", otpLimiter, validate(Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
  otp: Joi.string().length(6).required(),
})), async (req, res) => {
  let ok = false;
  try {
    ok = await verifyOtp(req.body.phone, req.body.otp);
  } catch (error) {
    if (error.message === "TWILIO_VERIFY_NOT_CONFIGURED") {
      return res.status(503).json({ error: "OTP_PROVIDER_NOT_CONFIGURED" });
    }
    console.error("verify_otp_failed", error);
    return res.status(502).json({ error: "OTP_VERIFICATION_FAILED" });
  }
  if (!ok) return res.status(401).json({ error: "INVALID_OTP" });

  const phone = normalizePhone(req.body.phone);
  const { rows } = await query(
    `INSERT INTO users (phone)
     VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET updated_at = now()
     RETURNING id, phone, name, email`,
    [phone],
  );
  const user = rows[0];
  const token = signToken({ sub: user.id, phone: user.phone });
  return res.json({ token, user });
});
