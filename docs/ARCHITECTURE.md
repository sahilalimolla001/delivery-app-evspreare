# Backend Architecture

## Modular Monolith First

Start with one deployable API for speed and consistency:

- Auth module
- Rider module
- Order module
- Assignment module
- Location module
- Earnings module
- Documents module
- Support module
- Admin module

Use PostgreSQL as the system of record, Redis for volatile matching state, Socket.IO for realtime updates, and FCM for push notifications.

## Scalable Microservice Architecture

When scale requires independent deployment, split into:

- Identity Service: OTP, JWT, sessions, device trust.
- Rider Service: profile, online status, vehicle, documents.
- Order Service: status machine, store/customer details, delivery OTP.
- Assignment Service: nearby rider ranking, offer timers, accept/reject.
- Location Service: high-volume GPS ingestion, cache, customer tracking.
- Earnings Service: payout formulas, incentives, wallet ledger.
- Notification Service: FCM, SMS, email, operational alerts.
- Support Service: tickets, SOS, chat routing.
- Admin Service: role-based control plane.

## Event Bus

Recommended events:

- `order.created`
- `store.accepted`
- `rider.location_updated`
- `order.offered`
- `order.accepted`
- `order.rejected`
- `order.status_changed`
- `order.delivered`
- `document.uploaded`
- `document.verified`
- `sos.created`

Use Kafka, AWS MSK, or SNS/SQS depending on team maturity.

## Critical Data Rules

- PostgreSQL remains authoritative for money, status, and compliance data.
- Redis can cache rider locations and assignment locks but must not be the only store.
- Every order status transition should be idempotent and audit logged.
- Delivery OTP must be hashed, time-boxed, and retry limited.
- Rider payout ledger must be append-only in production.
