# Security Best Practices

- Use Firebase OTP or telecom-grade OTP provider in production.
- Store JWT in Flutter secure storage, never plain shared preferences.
- Rotate JWT signing keys and use short access-token expiry with refresh tokens.
- Rate-limit OTP, login, resend, and support endpoints.
- Hash delivery OTPs.
- Validate all order status transitions server-side.
- Require GPS proximity for pickup and delivery.
- Sign S3 uploads with short-lived pre-signed URLs.
- Scan uploaded documents for malware.
- Encrypt sensitive PII fields where required.
- Use RBAC for admin panel actions.
- Audit admin approvals, suspensions, document decisions, and manual order assignments.
- Enforce HTTPS, HSTS, secure cookies for web surfaces, and certificate pinning for mobile if threat model requires it.
- Keep payout ledger append-only.
- Use idempotency keys for payout and order transition APIs.
