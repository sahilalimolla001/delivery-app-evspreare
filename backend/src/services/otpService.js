import bcrypt from "bcryptjs";
import twilio from "twilio";
import { config } from "../config.js";

const otpStore = new Map();

function normalizePhone(phone) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (/^[6-9]\d{9}$/.test(trimmed)) return `+91${trimmed}`;
  return `+${trimmed}`;
}

function twilioConfigured() {
  return Boolean(
    config.twilio.accountSid
      && config.twilio.authToken
      && config.twilio.verifyServiceSid,
  );
}

function mask(value) {
  const current = String(value || "");
  if (!current) return "";
  return `${current.slice(0, 2)}...${current.slice(-4)}`;
}

function getTwilioClient() {
  if (!twilioConfigured()) {
    throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
  }
  return twilio(config.twilio.accountSid, config.twilio.authToken);
}

async function sendDevOtp(phone) {
  const otp = "246813";
  const hash = await bcrypt.hash(otp, 10);
  otpStore.set(phone, {
    hash,
    expiresAt: Date.now() + config.otpTtlSeconds * 1000,
  });
  return { provider: "dev", devOtp: otp, to: phone };
}

async function verifyDevOtp(phone, otp) {
  const record = otpStore.get(phone);
  if (!record || record.expiresAt < Date.now()) return false;
  const ok = await bcrypt.compare(otp, record.hash);
  if (ok) otpStore.delete(phone);
  return ok;
}

export async function sendOtp(phone) {
  const normalizedPhone = normalizePhone(phone);

  if (config.otpProvider !== "twilio") {
    return sendDevOtp(normalizedPhone);
  }

  if (!twilioConfigured()) {
    if (config.nodeEnv === "production") throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
    return sendDevOtp(normalizedPhone);
  }

  const client = getTwilioClient();
  const verification = await client.verify.v2
    .services(config.twilio.verifyServiceSid)
    .verifications
    .create({ to: normalizedPhone, channel: config.twilio.channel });

  return {
    provider: "twilio",
    to: normalizedPhone,
    status: verification.status,
    channel: config.twilio.channel,
  };
}

export async function verifyOtp(phone, otp) {
  const normalizedPhone = normalizePhone(phone);

  if (config.otpProvider !== "twilio") {
    return verifyDevOtp(normalizedPhone, otp);
  }

  if (!twilioConfigured()) {
    if (config.nodeEnv === "production") throw new Error("TWILIO_VERIFY_NOT_CONFIGURED");
    return verifyDevOtp(normalizedPhone, otp);
  }

  const client = getTwilioClient();
  const check = await client.verify.v2
    .services(config.twilio.verifyServiceSid)
    .verificationChecks
    .create({ to: normalizedPhone, code: otp });

  return check.status === "approved";
}

export function twilioDiagnostics() {
  return {
    provider: config.otpProvider,
    configured: twilioConfigured(),
    accountSid: mask(config.twilio.accountSid),
    verifyServiceSid: mask(config.twilio.verifyServiceSid),
    verifyServicePrefix: config.twilio.verifyServiceSid?.slice(0, 2) || "",
    channel: config.twilio.channel,
  };
}

export { normalizePhone };
