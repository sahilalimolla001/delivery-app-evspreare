# Production Readiness Checklist

## Backend

- Validate all required environment variables at startup.
- Use `/health` for liveness and `/ready` for dependency readiness.
- Emit JSON logs with request IDs.
- Restrict CORS with `ALLOWED_ORIGINS`.
- Enable `TRUST_PROXY=true` behind AWS ALB or Nginx.
- Use idempotency keys for money and order mutation APIs.
- Store audit logs for order, rider, payout, document, and admin actions.
- Run database migrations in CI/CD before deployment.
- Keep Twilio, database, JWT, payment, and S3 secrets in a managed secret store.

## Mobile

- Store tokens in secure storage.
- Use certificate pinning if required by risk model.
- Handle background location permission transparently.
- Queue location updates offline and flush when online.
- Use FCM for order offer wakeups.

## Admin

- Put admin panel behind RBAC, MFA, and IP allowlists.
- Audit every approval, suspension, rejection, manual assignment, and payout action.
- Use separate admin API scopes from rider scopes.

## Data

- Enable RDS automated backups and point-in-time recovery.
- Use PostGIS for proximity and route verification.
- Use append-only ledger tables for payouts.
- Encrypt PII and document URLs where required.

## Observability

- Track p95/p99 API latency.
- Track OTP delivery and verification success rates.
- Track order assignment acceptance and timeout rates.
- Alert on stuck orders, high rejection rate, and location update gaps.
- Send mobile crashes to Sentry/Firebase Crashlytics.
