import bcrypt from "bcryptjs";

const otpStore = new Map();

export async function createOtp(phone) {
  const otp = process.env.NODE_ENV === "production"
    ? String(Math.floor(100000 + Math.random() * 900000))
    : "246813";
  const hash = await bcrypt.hash(otp, 10);
  otpStore.set(phone, { hash, expiresAt: Date.now() + 5 * 60 * 1000 });
  return otp;
}

export async function verifyOtp(phone, otp) {
  const record = otpStore.get(phone);
  if (!record || record.expiresAt < Date.now()) return false;
  const ok = await bcrypt.compare(otp, record.hash);
  if (ok) otpStore.delete(phone);
  return ok;
}
