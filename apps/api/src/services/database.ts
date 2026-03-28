import { Pool } from "pg";
import type {
  CustomerAccount,
  InvoiceRecord,
  QuoteRecord,
  Shipment,
  ShipmentDocument
} from "../../../../packages/shared/src/index.js";

type EntityName = "shipments" | "documents" | "invoices" | "quotes" | "customers";

interface PersistedEntity {
  id: string;
  tenantId?: string;
}

interface PlatformPersistenceSnapshot {
  shipments: Shipment[];
  documents: ShipmentDocument[];
  invoices: InvoiceRecord[];
  quotes: QuoteRecord[];
  customers: CustomerAccount[];
}

type PersistedCustomerRecord = CustomerAccount & { id: string };

const tableNames: Record<EntityName, string> = {
  shipments: "cc_shipments",
  documents: "cc_documents",
  invoices: "cc_invoices",
  quotes: "cc_quotes",
  customers: "cc_customers"
};

let pool: Pool | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

function getPool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString
    });
  }

  return pool;
}

function inferTenantId(row: PersistedEntity) {
  return row.tenantId ?? "shared";
}

async function ensureTables() {
  const db = getPool();

  if (!db) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS cc_shipments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cc_documents (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cc_invoices (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cc_quotes (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cc_customers (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function tableHasRows(entity: EntityName) {
  const db = getPool();

  if (!db) {
    return false;
  }

  const result = await db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${tableNames[entity]}`);
  return Number(result.rows[0]?.count ?? "0") > 0;
}

async function writeRows<T extends PersistedEntity>(entity: EntityName, rows: T[]) {
  const db = getPool();

  if (!db) {
    return;
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM ${tableNames[entity]}`);

    for (const [index, row] of rows.entries()) {
      await client.query(
        `INSERT INTO ${tableNames[entity]} (id, tenant_id, sort_order, payload) VALUES ($1, $2, $3, $4::jsonb)`,
        [row.id, inferTenantId(row), index, JSON.stringify(row)]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function readRows<T>(entity: EntityName) {
  const db = getPool();

  if (!db) {
    return [] as T[];
  }

  const result = await db.query<{ payload: T }>(
    `SELECT payload FROM ${tableNames[entity]} ORDER BY sort_order ASC, updated_at ASC`
  );
  return result.rows.map((row) => row.payload);
}

export function isDatabasePersistenceEnabled() {
  return Boolean(getDatabaseUrl());
}

export async function initializeDatabasePersistence(snapshot: PlatformPersistenceSnapshot) {
  if (!isDatabasePersistenceEnabled()) {
    return null;
  }

  await ensureTables();

  const seededRows: PlatformPersistenceSnapshot = {
    shipments: snapshot.shipments,
    documents: snapshot.documents,
    invoices: snapshot.invoices,
    quotes: snapshot.quotes,
    customers: snapshot.customers.map((customer): PersistedCustomerRecord => ({
      ...customer,
      id: `${customer.tenantId}:${customer.name}`
    })) as CustomerAccount[]
  };

  if (!(await tableHasRows("shipments"))) {
    await writeRows("shipments", seededRows.shipments);
  }

  if (!(await tableHasRows("documents"))) {
    await writeRows(
      "documents",
      seededRows.documents.map((document) => ({
        ...document,
        tenantId: snapshot.shipments.find((shipment) => shipment.id === document.shipmentId)?.tenantId ?? "shared"
      }))
    );
  }

  if (!(await tableHasRows("invoices"))) {
    await writeRows("invoices", seededRows.invoices);
  }

  if (!(await tableHasRows("quotes"))) {
    await writeRows("quotes", seededRows.quotes);
  }

  if (!(await tableHasRows("customers"))) {
    await writeRows("customers", seededRows.customers as Array<CustomerAccount & PersistedEntity>);
  }

  const [shipments, documents, invoices, quotes, customers] = await Promise.all([
    readRows<Shipment>("shipments"),
    readRows<ShipmentDocument>("documents"),
    readRows<InvoiceRecord>("invoices"),
    readRows<QuoteRecord>("quotes"),
    readRows<PersistedCustomerRecord>("customers")
  ]);

  return {
    shipments,
    documents,
    invoices,
    quotes,
    customers: customers.map((row: PersistedCustomerRecord) => {
      const { id: _id, ...customer } = row;
      return customer;
    })
  } satisfies PlatformPersistenceSnapshot;
}

export async function persistDatabaseEntity<T extends PersistedEntity>(entity: EntityName, rows: T[]) {
  if (!isDatabasePersistenceEnabled()) {
    return;
  }

  await writeRows(entity, rows);
}
