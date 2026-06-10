# Deployment Guide

## AWS Reference Stack

- Mobile: Play Store and App Store builds from Flutter.
- API: ECS Fargate or EKS.
- Database: Amazon RDS PostgreSQL with PostGIS.
- Cache: ElastiCache Redis.
- Files: S3 with private buckets and CloudFront signed URLs if needed.
- Realtime: Socket.IO on ECS with Redis adapter.
- Notifications: Firebase Cloud Messaging.
- Secrets: AWS Secrets Manager.
- Logs: CloudWatch plus OpenTelemetry collector.
- CI/CD: GitHub Actions.

## Backend

1. Create RDS PostgreSQL database.
2. Run `database/schema.sql`.
3. Set environment variables from `backend/.env.example`.
4. Build Docker image.
5. Deploy API behind an ALB.
6. Enable autoscaling on CPU, memory, and request count.
7. Attach WAF and rate-limit rules.

## Twilio OTP

1. Create a Twilio Verify Service.
2. Set `OTP_PROVIDER=twilio`.
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID`.
4. Keep `TWILIO_AUTH_TOKEN` in AWS Secrets Manager or another managed secret store.
5. Use Twilio Verify fraud guard, country allowlists, and delivery analytics.

## Flutter Release

1. Configure bundle IDs and app icons.
2. Add Google Maps API keys.
3. Add Firebase config files.
4. Configure Android background location permission.
5. Configure iOS location usage descriptions.
6. Build:

```bash
flutter build apk --release
flutter build appbundle --release
flutter build ipa --release
```

## Store Readiness

- Privacy policy URL.
- Terms URL.
- Background location disclosure.
- Support contact.
- App screenshots.
- Test account credentials.
- Data safety form.
