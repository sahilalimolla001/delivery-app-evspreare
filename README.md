# Quick Commerce Rider App

Enterprise-grade starter for a Blinkit, Zepto, and Swiggy Instamart style delivery rider platform.

This repository contains:

- Static UI preview for all 16 rider screens.
- Flutter rider app source scaffold with Material 3 blue/white theme and dark mode.
- Node.js + Express backend APIs for OTP, riders, orders, earnings, documents, wallet, support, and admin.
- PostgreSQL schema for core production data.
- Socket.IO live location tracking architecture.
- Admin panel static UI.
- API, UX, deployment, security, design system, and microservice architecture docs.

## Local Preview

The existing web preview can run with:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Production Layout

```text
backend/          Node.js Express API and Socket.IO server
database/         PostgreSQL schema and seed data
rider_app/        Flutter rider app source scaffold
admin_panel/      Admin dashboard UI starter
docs/             Product, API, UX, design, security, and deployment docs
index.html        Interactive 16-screen rider UI preview
app.js
styles.css
```

## Core Order Flow

`PENDING -> ASSIGNED -> GOING_TO_STORE -> ARRIVED_STORE -> PICKED_UP -> GOING_TO_CUSTOMER -> ARRIVED_CUSTOMER -> DELIVERED`

## Main Algorithms

- Auto-login checks JWT/session validity before routing to dashboard.
- OTP login validates phone, sends OTP, verifies OTP, then issues JWT.
- Online riders publish GPS location every 5 seconds.
- Assignment engine finds riders within 3 km, sorts by distance, rating, and acceptance rate.
- New order offer uses a 15-second accept/reject timer.
- Pickup and delivery actions require GPS proximity validation.
- Delivery completion requires customer OTP verification.
- Incentives are calculated from completed daily order thresholds.

## Backend Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Docker Quick Start

```bash
docker compose up --build
```

API:

- Liveness: `http://localhost:8080/health`
- Readiness: `http://localhost:8080/ready`

## Database Quick Start

```bash
psql "$DATABASE_URL" -f ../database/schema.sql
```

## Flutter Quick Start

```bash
cd rider_app
flutter pub get
flutter run
```

## Admin Panel

Open `admin_panel/index.html` or host it behind an authenticated admin domain.

## Production Notes

Before release, wire real providers:

- Twilio Verify for production OTP delivery and verification.
- Firebase Cloud Messaging for push notifications.
- Google Maps SDK/API keys.
- AWS S3 for document uploads.
- Razorpay/Cashfree/PhonePe for payouts.
- Managed PostgreSQL with read replicas and backups.
- Redis for order assignment locks and location cache.
- Observability with OpenTelemetry, CloudWatch/Datadog, Sentry, and structured logs.

See [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) before launch.
