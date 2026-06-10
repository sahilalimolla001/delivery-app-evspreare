import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(8080),
  DATABASE_URL: Joi.string().uri({ scheme: ["postgres", "postgresql"] }).allow("").optional(),
  JWT_SECRET: Joi.string().min(16).when("NODE_ENV", {
    is: "production",
    then: Joi.required(),
    otherwise: Joi.string().min(16).default("dev-only-secret-key"),
  }),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  ALLOWED_ORIGINS: Joi.string().allow("").default(""),
  TRUST_PROXY: Joi.boolean().truthy("true").falsy("false").default(false),
  OTP_TTL_SECONDS: Joi.number().integer().min(60).max(900).default(300),
  OTP_PROVIDER: Joi.string().valid("dev", "twilio").default("dev"),
  TWILIO_ACCOUNT_SID: Joi.string().allow("").optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow("").optional(),
  TWILIO_VERIFY_SERVICE_SID: Joi.string().allow("").optional(),
  TWILIO_OTP_CHANNEL: Joi.string().valid("sms", "call", "whatsapp", "email").default("sms"),
  GOOGLE_MAPS_API_KEY: Joi.string().allow("").optional(),
  S3_BUCKET: Joi.string().allow("").optional(),
  FCM_SERVER_KEY: Joi.string().allow("").optional(),
}).unknown(true);

const { value: env, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

if (env.NODE_ENV === "production" && env.OTP_PROVIDER === "twilio") {
  const missingTwilio = [
    ["TWILIO_ACCOUNT_SID", env.TWILIO_ACCOUNT_SID],
    ["TWILIO_AUTH_TOKEN", env.TWILIO_AUTH_TOKEN],
    ["TWILIO_VERIFY_SERVICE_SID", env.TWILIO_VERIFY_SERVICE_SID],
  ].filter(([, current]) => !current);
  if (missingTwilio.length > 0) {
    throw new Error(`Missing Twilio production config: ${missingTwilio.map(([key]) => key).join(", ")}`);
  }
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET || "dev-only-secret-key",
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  allowedOrigins: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  trustProxy: env.TRUST_PROXY,
  otpTtlSeconds: env.OTP_TTL_SECONDS,
  otpProvider: env.OTP_PROVIDER,
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: env.TWILIO_VERIFY_SERVICE_SID,
    channel: env.TWILIO_OTP_CHANNEL,
  },
};
