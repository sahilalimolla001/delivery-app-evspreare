import express from "express";
import { query } from "../db.js";

export const earningsRouter = express.Router();

earningsRouter.get("/earnings", async (req, res) => {
  const { rows } = await query(
    `SELECT e.*
     FROM earnings e
     JOIN riders r ON r.id = e.rider_id
     WHERE r.user_id = $1
     ORDER BY e.created_at DESC
     LIMIT 200`,
    [req.auth.sub],
  );
  const total = rows.reduce((sum, row) => sum + Number(row.total), 0);
  res.json({ total, transactions: rows });
});

earningsRouter.get("/wallet", async (req, res) => {
  const { rows } = await query(
    `SELECT w.*
     FROM wallets w
     JOIN riders r ON r.id = w.rider_id
     WHERE r.user_id = $1`,
    [req.auth.sub],
  );
  res.json(rows[0] || { available_balance: 0, pending_balance: 0 });
});

earningsRouter.post("/withdraw", async (req, res) => {
  res.status(202).json({ message: "WITHDRAWAL_REQUEST_ACCEPTED", provider: req.body.provider || "manual" });
});
