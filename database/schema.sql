CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE user_status AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');
CREATE TYPE rider_status AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');
CREATE TYPE document_status AS ENUM ('PENDING', 'OCR_VERIFIED', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'ASSIGNED',
  'GOING_TO_STORE',
  'ARRIVED_STORE',
  'PICKED_UP',
  'GOING_TO_CUSTOMER',
  'ARRIVED_CUSTOMER',
  'DELIVERED',
  'CANCELLED'
);
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(180) UNIQUE,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  rider_code VARCHAR(32) UNIQUE NOT NULL,
  vehicle_number VARCHAR(32),
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  acceptance_rate NUMERIC(5,2) NOT NULL DEFAULT 100,
  online_status BOOLEAN NOT NULL DEFAULT false,
  approval_status rider_status NOT NULL DEFAULT 'PENDING',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id VARCHAR(32) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  rider_id UUID REFERENCES riders(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  delivery_otp_hash TEXT,
  base_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  distance_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  surge NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  tips NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit VARCHAR(40),
  image_url TEXT
);

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES riders(id),
  order_id UUID REFERENCES orders(id),
  base_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  distance_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  surge NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  tips NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES riders(id),
  type VARCHAR(60) NOT NULL,
  file_url TEXT NOT NULL,
  ocr_payload JSONB NOT NULL DEFAULT '{}',
  status document_status NOT NULL DEFAULT 'PENDING',
  expires_at DATE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES riders(id),
  order_id UUID REFERENCES orders(id),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  heading NUMERIC(6,2),
  speed NUMERIC(6,2),
  accuracy NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES riders(id),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID UNIQUE NOT NULL REFERENCES riders(id),
  available_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES riders(id),
  amount NUMERIC(12,2) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  provider_ref VARCHAR(120),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_riders_online ON riders(online_status, approval_status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_locations_rider_created ON locations(rider_id, created_at DESC);
CREATE INDEX idx_locations_order_created ON locations(order_id, created_at DESC);
CREATE INDEX idx_stores_location ON stores USING GIST(location);
CREATE INDEX idx_customers_location ON customers USING GIST(location);
