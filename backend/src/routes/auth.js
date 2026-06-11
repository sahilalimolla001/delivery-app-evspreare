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

authRouter.post("/rider-status", validate(Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
})), async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { rows } = await query(
    `SELECT u.id, u.phone, r.id AS rider_id, r.approval_status
     FROM users u
     LEFT JOIN riders r ON r.user_id = u.id
     WHERE u.phone = $1`,
    [phone],
  );
  const rider = rows.find((row) => row.rider_id);
  res.json({
    phone,
    exists: Boolean(rider),
    approvalStatus: rider?.approval_status || null,
    canLogin: rider?.approval_status === "APPROVED",
  });
});

authRouter.post("/rider-signup", otpLimiter, validate(Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
  email: Joi.string().trim().email().allow("").optional(),
  vehicleNumber: Joi.string().trim().min(4).max(32).required(),
})), async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const email = req.body.email || null;
  const riderCode = `RD${Date.now().toString().slice(-8)}`;

  try {
    const { rows: users } = await query(
      `INSERT INTO users (name, phone, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone) DO UPDATE
       SET name = EXCLUDED.name,
           email = COALESCE(EXCLUDED.email, users.email),
           updated_at = now()
       RETURNING id, name, phone, email`,
      [req.body.name, phone, email],
    );
    const user = users[0];

    const existing = await query("SELECT id, approval_status FROM riders WHERE user_id = $1", [user.id]);
    if (existing.rows[0]) {
      await query(
        "UPDATE riders SET vehicle_number = $1, updated_at = now() WHERE id = $2",
        [req.body.vehicleNumber, existing.rows[0].id],
      );
    } else {
      await query(
        `INSERT INTO riders (user_id, rider_code, vehicle_number, approval_status)
         VALUES ($1, $2, $3, 'PENDING')`,
        [user.id, riderCode, req.body.vehicleNumber],
      );
    }

    res.status(201).json({
      message: "RIDER_SIGNUP_CREATED",
      user,
      approvalStatus: "PENDING",
    });
  } catch (error) {
    console.error("rider_signup_failed", error);
    return res.status(500).json({ error: "RIDER_SIGNUP_FAILED" });
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
    `SELECT u.id, u.phone, u.name, u.email, r.id AS rider_id, r.rider_code, r.approval_status
     FROM users u
     LEFT JOIN riders r ON r.user_id = u.id
     WHERE u.phone = $1`,
    [phone],
  );
  if (!rows[0] || !rows[0].rider_id) {
    return res.json({ phone, requiresSignup: true, approvalStatus: null });
  }
  const user = rows[0];
  if (user.approval_status !== "APPROVED") {
    if (user.approval_status === "PENDING") {
      return res.json({ phone, pendingApproval: true, approvalStatus: "PENDING" });
    }
    return res.status(403).json({
      error: "RIDER_SUSPENDED",
      approvalStatus: user.approval_status,
    });
  }
  const token = signToken({ sub: user.id, phone: user.phone });
  return res.json({ token, user });
});
