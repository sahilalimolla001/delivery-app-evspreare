# API Documentation

Base URL: `https://api.example.com`

Authentication: `Authorization: Bearer <jwt>`

## Auth

### POST `/send-otp`

Request:

```json
{ "phone": "+919876543210" }
```

Response:

```json
{ "message": "OTP_SENT" }
```

### POST `/verify-otp`

Request:

```json
{ "phone": "+919876543210", "otp": "246813" }
```

Response:

```json
{ "token": "jwt", "user": { "id": "uuid", "phone": "+919876543210" } }
```

## Rider

- `GET /profile`
- `POST /online`
- `POST /offline`

`POST /online` request:

```json
{ "latitude": 12.9121, "longitude": 77.6446 }
```

## Orders

- `GET /orders`
- `POST /accept-order`
- `POST /reject-order`
- `POST /pickup-order`
- `POST /deliver-order`

`POST /deliver-order` request:

```json
{
  "orderId": "uuid",
  "otp": "123456",
  "latitude": 12.9121,
  "longitude": 77.6446
}
```

## Documents

### POST `/upload-document`

Multipart form-data:

- `type`: `AADHAAR`, `DRIVING_LICENSE`, `VEHICLE_RC`, `INSURANCE`, `POLLUTION`
- `file`: document image or PDF

## Earnings and Wallet

- `GET /earnings`
- `GET /wallet`
- `POST /withdraw`

## Support

- `POST /support-ticket`
- `POST /sos`

## Realtime Events

Socket namespace: `/`

Client emits:

- `rider:join`
- `order:watch`
- `location:update`

Server emits:

- `location:changed`
- `order:offered`
- `order:assigned`
- `order:status_changed`
