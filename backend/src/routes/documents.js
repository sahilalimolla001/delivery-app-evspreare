import express from "express";
import multer from "multer";
import { query } from "../db.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
export const documentsRouter = express.Router();

documentsRouter.post("/upload-document", upload.single("file"), async (req, res) => {
  const rider = await getRider(req.auth.sub);
  if (!rider) return res.status(404).json({ error: "RIDER_NOT_FOUND" });
  const type = req.body.type || "UNKNOWN";
  const fileUrl = `s3://pending-upload/${Date.now()}-${req.file?.originalname || "document"}`;
  const { rows } = await query(
    `INSERT INTO documents (rider_id, type, file_url, status)
     VALUES ($1, $2, $3, 'PENDING')
     RETURNING *`,
    [rider.id, type, fileUrl],
  );
  res.status(201).json({ document: rows[0], nextStep: "OCR_VERIFICATION" });
});

async function getRider(userId) {
  const { rows } = await query("SELECT * FROM riders WHERE user_id = $1", [userId]);
  return rows[0];
}
