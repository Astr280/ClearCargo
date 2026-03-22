CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  primary_domain TEXT,
  logo_url TEXT,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role_code TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  company_type TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  credit_terms_days INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  job_number TEXT NOT NULL,
  mode TEXT NOT NULL,
  shipment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  shipper_company_id UUID REFERENCES companies(id),
  consignee_company_id UUID REFERENCES companies(id),
  incoterm_code TEXT,
  commodity TEXT,
  hs_code TEXT,
  gross_weight_kg NUMERIC(12,2),
  volume_cbm NUMERIC(12,3),
  piece_count INTEGER,
  dangerous_goods BOOLEAN NOT NULL DEFAULT FALSE,
  reefer BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, job_number)
);

CREATE TABLE shipment_milestones (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  milestone_code TEXT NOT NULL,
  milestone_status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ,
  updated_by UUID REFERENCES users(id),
  notes TEXT
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  customer_visible BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customs_entries (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  filing_status TEXT NOT NULL,
  country_code TEXT NOT NULL,
  duty_amount NUMERIC(14,2),
  tax_amount NUMERIC(14,2),
  filing_reference TEXT,
  filed_by UUID REFERENCES users(id),
  filed_at TIMESTAMPTZ
);

CREATE TABLE screening_runs (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  screening_source TEXT NOT NULL,
  result_status TEXT NOT NULL,
  matched_entity TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  shipment_id UUID REFERENCES shipments(id),
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  subtotal_amount NUMERIC(14,2) NOT NULL,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL,
  due_date DATE,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  charge_code TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL,
  line_total NUMERIC(14,2) NOT NULL
);

CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  warehouse_name TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  aisle_code TEXT,
  bay_code TEXT,
  bin_code TEXT,
  temperature_zone TEXT
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  shipment_id UUID REFERENCES shipments(id),
  warehouse_location_id UUID REFERENCES warehouse_locations(id),
  sku TEXT,
  description TEXT NOT NULL,
  quantity_on_hand NUMERIC(12,2) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  last_counted_at TIMESTAMPTZ
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_company_id UUID NOT NULL REFERENCES companies(id),
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL,
  valid_until DATE,
  converted_shipment_id UUID REFERENCES shipments(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, quote_number)
);
