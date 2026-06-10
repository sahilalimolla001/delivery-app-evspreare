import pg from "pg";
import { config } from "./config.js";
import { logger } from "./logger.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query(text, params = []) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 500) {
    logger.warn("slow_query", { duration, text });
  }
  return result;
}

export async function readinessCheck() {
  const result = await query("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
}
