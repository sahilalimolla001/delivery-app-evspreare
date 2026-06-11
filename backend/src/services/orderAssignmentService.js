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

export async function findNextAvailableRider() {
  const { rows } = await query(
    `SELECT r.id
     FROM riders r
     LEFT JOIN orders active_orders
       ON active_orders.rider_id = r.id
      AND active_orders.status IN (
        'ASSIGNED',
        'GOING_TO_STORE',
        'ARRIVED_STORE',
        'PICKED_UP',
        'GOING_TO_CUSTOMER',
        'ARRIVED_CUSTOMER'
      )
     WHERE r.online_status = true
       AND r.approval_status = 'APPROVED'
     GROUP BY r.id
     ORDER BY count(active_orders.id) ASC, r.rating DESC, r.acceptance_rate DESC, r.last_seen_at DESC NULLS LAST
     LIMIT 1`,
  );
  return rows[0] || null;
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

export async function dispatchOrderToRider(order) {
  if (!order || order.status !== "PENDING") return { order, assigned: false, riderId: order?.rider_id || null };

  const { rows: orderLocations } = await query(
    `SELECT o.id, o.status, o.rider_id, s.latitude, s.longitude
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     WHERE o.id = $1`,
    [order.id],
  );
  const orderLocation = orderLocations[0] || order;

  let rider = null;
  if (orderLocation.latitude && orderLocation.longitude) {
    try {
      const nearbyRiders = await findNearbyRiders({
        latitude: Number(orderLocation.latitude),
        longitude: Number(orderLocation.longitude),
        radiusKm: 5,
      });
      rider = nearbyRiders[0] || null;
    } catch (_error) {
      rider = null;
    }
  }

  rider ||= await findNextAvailableRider();
  if (!rider) return { order, assigned: false, riderId: null };

  const assignedOrder = await assignOrderToRider({ orderId: order.id, riderId: rider.id });
  return {
    order: assignedOrder || order,
    assigned: Boolean(assignedOrder),
    riderId: assignedOrder ? rider.id : null,
  };
}
