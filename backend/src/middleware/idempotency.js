import { createHash } from "crypto";

const store = new Map();

function bodyFingerprint(req) {
  return createHash("sha256")
    .update(JSON.stringify(req.body || {}))
    .digest("hex");
}

export function idempotency({ ttlMs = 10 * 60 * 1000 } = {}) {
  return (req, res, next) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();

    const key = req.headers["idempotency-key"];
    if (!key) return next();

    const scope = `${req.auth?.sub || "anonymous"}:${req.method}:${req.originalUrl}:${key}`;
    const now = Date.now();
    const existing = store.get(scope);

    if (existing && existing.expiresAt > now) {
      if (existing.fingerprint !== bodyFingerprint(req)) {
        return res.status(409).json({ error: "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_BODY" });
      }
      return res.status(existing.status).json(existing.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(scope, {
          body,
          status: res.statusCode,
          fingerprint: bodyFingerprint(req),
          expiresAt: now + ttlMs,
        });
      }
      return originalJson(body);
    };

    return next();
  };
}
