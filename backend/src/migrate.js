import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../database/schema.sql");

async function migrate() {
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
