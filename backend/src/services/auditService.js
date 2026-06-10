import { query } from "../db.js";
import { logger } from "../logger.js";

export async function auditLog({ actorUserId, action, entityType, entityId, metadata = {}, requestId }) {
  try {
    await query(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, request_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorUserId || null, action, entityType, entityId || null, metadata, requestId || null],
    );
  } catch (error) {
    logger.warn("audit_log_failed", { action, entityType, entityId, error: error.message });
  }
}
