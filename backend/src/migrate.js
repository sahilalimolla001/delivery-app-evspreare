import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundledSchemaPath = path.resolve(__dirname, "../database/schema.sql");
const repoSchemaPath = path.resolve(__dirname, "../../database/schema.sql");
const schemaPath = fs.existsSync(bundledSchemaPath) ? bundledSchemaPath : repoSchemaPath;

async function migrate() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required. Attach Railway Postgres or set DATABASE_URL before running migration.");
  }
  const schema = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schema);
  await pool.end();
  console.log("Database schema applied");
}

migrate().catch(async (error) => {
  await pool.end().catch(() => {});
  console.error("Database migration failed", error);
  process.exit(1);
});
