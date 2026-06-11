# Railway production environment

Set these variables in Railway.

Backend service:
- `NODE_ENV=production`
- `PORT` is provided by Railway
- `DATABASE_URL` from the Railway Postgres plugin
- `JWT_SECRET` strong random value, at least 16 characters
- `ADMIN_API_KEY` strong random value used by the admin panel
- `ALLOWED_ORIGINS=https://your-rider-app.up.railway.app,https://your-admin-panel.up.railway.app`
- `TRUST_PROXY=true`
- `OTP_PROVIDER=twilio`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`
- `TWILIO_OTP_CHANNEL=sms`

Rider web preview service:
- `PUBLIC_API_BASE_URL=https://your-backend-service.up.railway.app`

Merged backend + admin panel:
- Deploy only the backend service with root directory `backend`.
- Open the admin panel at `https://your-backend-service.up.railway.app/admin`.
- A separate admin panel Railway service is no longer required.

Database setup:
- From the backend service shell, run `npm run migrate` once after attaching Railway Postgres.
