DROP TABLE IF EXISTS backup_logs CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS parties CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS backup_status CASCADE;
DROP TYPE IF EXISTS ledger_status CASCADE;
DROP TYPE IF EXISTS ledger_entry_type CASCADE;
DROP TYPE IF EXISTS stock_movement_type CASCADE;
DROP TYPE IF EXISTS party_type CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- ENUMS
-- =========================

CREATE TYPE product_type AS ENUM (
  'MEDICINE',
  'FARM_SUPPLY',
  'OTHER'
);

CREATE TYPE party_type AS ENUM (
  'CUSTOMER',
  'SUPPLIER',
  'BOTH'
);

CREATE TYPE stock_movement_type AS ENUM (
  'IN',
  'OUT',
  'RETURN',
  'DAMAGED',
  'ADJUSTMENT'
);

CREATE TYPE ledger_entry_type AS ENUM (
  'CUSTOMER_DEBIT',
  'CUSTOMER_CREDIT',
  'SUPPLIER_DEBIT',
  'SUPPLIER_CREDIT'
);

CREATE TYPE ledger_status AS ENUM (
  'PENDING',
  'PAID',
  'PARTIAL',
  'CANCELLED'
);

CREATE TYPE backup_status AS ENUM (
  'SUCCESS',
  'FAILED'
);

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- PRODUCTS
-- =========================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type product_type NOT NULL DEFAULT 'MEDICINE',
  code VARCHAR(100) UNIQUE,
  manufacturer VARCHAR(150),
  unit VARCHAR(50) NOT NULL DEFAULT 'unit',
  min_stock INTEGER NOT NULL DEFAULT 0,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  track_expiry BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- BATCHES
-- =========================

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  batch_number VARCHAR(100),
  expiry_date DATE,

  current_quantity INTEGER NOT NULL DEFAULT 0,

  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT batch_quantity_not_negative CHECK (current_quantity >= 0)
);

-- =========================
-- PARTIES
-- =========================

CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type party_type NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- STOCK MOVEMENTS
-- =========================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,

  reference_number VARCHAR(100),
  reason VARCHAR(100),
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT stock_quantity_not_zero CHECK (quantity <> 0)
);

-- =========================
-- LEDGER ENTRIES
-- =========================

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  type ledger_entry_type NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,

  reference_number VARCHAR(100),

  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,

  status ledger_status NOT NULL DEFAULT 'PENDING',
  description TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT ledger_amount_positive CHECK (amount > 0)
);

-- =========================
-- BACKUP LOGS
-- =========================

CREATE TABLE backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  backup_name VARCHAR(255) NOT NULL,
  backup_type VARCHAR(30) NOT NULL,
  status backup_status NOT NULL DEFAULT 'SUCCESS',

  file_size BIGINT,
  records_count INTEGER,
  duration_ms INTEGER,

  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_is_active ON products(is_active);

CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_batch_number ON batches(batch_number);
CREATE INDEX idx_batches_expiry_date ON batches(expiry_date);
CREATE INDEX idx_batches_is_active ON batches(is_active);

CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_parties_is_active ON parties(is_active);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_batch_id ON stock_movements(batch_id);
CREATE INDEX idx_stock_movements_party_id ON stock_movements(party_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_movement_date ON stock_movements(movement_date);
CREATE INDEX idx_stock_movements_reference_number ON stock_movements(reference_number);

CREATE INDEX idx_ledger_entries_party_id ON ledger_entries(party_id);
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
CREATE INDEX idx_ledger_entries_status ON ledger_entries(status);
CREATE INDEX idx_ledger_entries_entry_date ON ledger_entries(entry_date);
CREATE INDEX idx_ledger_entries_due_date ON ledger_entries(due_date);
CREATE INDEX idx_ledger_entries_reference_number ON ledger_entries(reference_number);

CREATE INDEX idx_backup_logs_created_by_id ON backup_logs(created_by_id);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);