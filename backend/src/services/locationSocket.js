import { query } from "../db.js";

export function registerLocationSocket(io) {
  io.on("connection", (socket) => {
    socket.on("rider:join", ({ riderId }) => {
      if (riderId) socket.join(`rider:${riderId}`);
    });

    socket.on("order:watch", ({ orderId }) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on("location:update", async (payload, ack) => {
      try {
        const { riderId, orderId, latitude, longitude, heading, speed, accuracy } = payload;
        await query(
          `INSERT INTO locations (rider_id, order_id, latitude, longitude, heading, speed, accuracy)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [riderId, orderId || null, latitude, longitude, heading || null, speed || null, accuracy || null],
        );
        if (orderId) io.to(`order:${orderId}`).emit("location:changed", payload);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, error: "LOCATION_UPDATE_FAILED" });
      }
    });
  });
}
