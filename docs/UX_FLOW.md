# Complete UX Flow

## Rider Onboarding

1. Splash validates JWT.
2. Login accepts phone number or social login.
3. OTP verifies rider identity.
4. Profile completion gathers rider, vehicle, bank, and document data.
5. Admin approves rider.
6. Rider can go online.

## Active Delivery Flow

1. Rider toggles online.
2. App requests foreground/background location permission.
3. Location updates publish every 5 seconds.
4. Assignment engine offers nearby order.
5. Rider accepts within 15 seconds.
6. Rider navigates to store.
7. Pickup button unlocks when rider is within 100 meters.
8. Rider confirms pickup.
9. Rider navigates to customer.
10. Delivery button unlocks near customer.
11. Customer OTP is verified.
12. Order is marked delivered.
13. Earnings are credited.

## Exceptional Flows

- Reject order: offer passes to next rider.
- Timer expires: offer passes to next rider.
- GPS unavailable: rider cannot go online or complete proximity-gated actions.
- OTP failure: delivery remains pending and retry limits apply.
- SOS: support ticket is created, live location is shared, and support call is initiated.
