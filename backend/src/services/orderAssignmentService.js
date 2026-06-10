import { query } from "../db.js";

export async function findNearbyRiders({ latitude, longitude, radiusKm = 3 }) {
  const sql = `
    SELECT
      r.id,
      r.rating,
      r.acceptance_rate,
      latest.latitude,
      latest.longitude,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(latest.longitude, latest.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
      ) / 1000 AS distance_km
    FROM riders r
    JOIN LATERAL (
      SELECT latitude, longitude
      FROM locations
      WHERE rider_id = r.id
      ORDER BY created_at DESC
      LIMIT 1
    ) latest ON true
    WHERE r.online_status = true
      AND r.approval_status = 'APPROVED'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(latest.longitude, latest.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
        $3 * 1000
      )
    ORDER BY distance_km ASC, r.rating DESC, r.acceptance_rate DESC
    LIMIT 20
  `;
  const { rows } = await query(sql, [latitude, longitude, radiusKm]);
  return rows;
}

export async function assignOrderToRider({ orderId, riderId }) {
  const { rows } = await query(
    `UPDATE orders
     SET rider_id = $2, status = 'ASSIGNED', assigned_at = now(), updated_at = now()
     WHERE id = $1 AND status IN ('PENDING', 'ASSIGNED')
     RETURNING *`,
    [orderId, riderId],
  );
  return rows[0];
}
