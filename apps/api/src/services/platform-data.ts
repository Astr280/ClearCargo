import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  forceSyncDatabasePersistence,
  getDatabasePersistenceStatus,
  initializeDatabasePersistence,
  isDatabasePersistenceEnabled,
  persistDatabaseEntity
} from "./database.js";
import {
  complianceQueue,
  type CreateQuoteInput,
  type CreateShipmentDocumentVersionInput,
  type CreateShipmentDocumentInput,
  type CreateShipmentInput,
  customers,
  financeSummary,
  invoices,
  platformOverview,
  quotes,
  shipments,
  shipmentDocuments,
  tenants,
  type FinanceSummary,
  type InvoiceRecord,
  type PersistenceStatus,
  type QuoteRecord,
  type QuoteStage,
  type ShipmentCostLine,
  type ShipmentDetail,
  type ShipmentDocument,
  type Shipment,
  type ShipmentStage,
  type UpdateShipmentDocumentInput,
  type UpdateShipmentInput,
  type UserRole,
  warehouseTasks
} from "../../../../packages/shared/src/index.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const shipmentDataCandidates = [
  path.resolve(process.cwd(), "data/shipments.json"),
  path.resolve(currentDir, "../../../../data/shipments.json"),
  path.resolve(currentDir, "../../../../../../data/shipments.json")
];
const shipmentDataPath =
  shipmentDataCandidates.find((candidate) => fs.existsSync(path.dirname(candidate))) ?? shipmentDataCandidates[0];
const seededShipments: Shipment[] = structuredClone(shipments);

const documentDataCandidates = [
  path.resolve(process.cwd(), "data/shipment-documents.json"),
  path.resolve(currentDir, "../../../../data/shipment-documents.json"),
  path.resolve(currentDir, "../../../../../../data/shipment-documents.json")
];
const documentDataPath =
  documentDataCandidates.find((candidate) => fs.existsSync(path.dirname(candidate))) ?? documentDataCandidates[0];
const seededDocuments: ShipmentDocument[] = structuredClone(shipmentDocuments);

const invoiceDataCandidates = [
  path.resolve(process.cwd(), "data/invoices.json"),
  path.resolve(currentDir, "../../../../data/invoices.json"),
  path.resolve(currentDir, "../../../../../../data/invoices.json")
];
const invoiceDataPath =
  invoiceDataCandidates.find((candidate) => fs.existsSync(path.dirname(candidate))) ?? invoiceDataCandidates[0];
const seededInvoices: InvoiceRecord[] = structuredClone(invoices);

const quoteDataCandidates = [
  path.resolve(process.cwd(), "data/quotes.json"),
  path.resolve(currentDir, "../../../../data/quotes.json"),
  path.resolve(currentDir, "../../../../../../data/quotes.json")
];
const quoteDataPath =
  quoteDataCandidates.find((candidate) => fs.existsSync(path.dirname(candidate))) ?? quoteDataCandidates[0];
const seededQuotes: QuoteRecord[] = structuredClone(quotes);
const seededCustomers = structuredClone(customers);

function loadShipmentStore() {
  if (!fs.existsSync(shipmentDataPath)) {
    fs.writeFileSync(shipmentDataPath, JSON.stringify(seededShipments, null, 2));
    return structuredClone(seededShipments);
  }

  const raw = fs.readFileSync(shipmentDataPath, "utf-8");
  return JSON.parse(raw) as Shipment[];
}

function persistShipments() {
  fs.writeFileSync(shipmentDataPath, JSON.stringify(shipmentStore, null, 2));
}

function loadDocumentStore() {
  if (!fs.existsSync(documentDataPath)) {
    fs.writeFileSync(documentDataPath, JSON.stringify(seededDocuments, null, 2));
    return structuredClone(seededDocuments);
  }

  const raw = fs.readFileSync(documentDataPath, "utf-8");
  return JSON.parse(raw) as ShipmentDocument[];
}

function persistDocuments() {
  fs.writeFileSync(documentDataPath, JSON.stringify(documentStore, null, 2));
}

function loadInvoiceStore() {
  if (!fs.existsSync(invoiceDataPath)) {
    fs.writeFileSync(invoiceDataPath, JSON.stringify(seededInvoices, null, 2));
    return structuredClone(seededInvoices);
  }

  const raw = fs.readFileSync(invoiceDataPath, "utf-8");
  return JSON.parse(raw) as InvoiceRecord[];
}

function persistInvoices() {
  fs.writeFileSync(invoiceDataPath, JSON.stringify(invoiceStore, null, 2));
}

function loadQuoteStore() {
  if (!fs.existsSync(quoteDataPath)) {
    fs.writeFileSync(quoteDataPath, JSON.stringify(seededQuotes, null, 2));
    return structuredClone(seededQuotes);
  }

  const raw = fs.readFileSync(quoteDataPath, "utf-8");
  return JSON.parse(raw) as QuoteRecord[];
}

function persistQuotes() {
  fs.writeFileSync(quoteDataPath, JSON.stringify(quoteStore, null, 2));
}

async function persistShipmentsToStorage() {
  persistShipments();
  await persistDatabaseEntity("shipments", shipmentStore);
}

async function persistDocumentsToStorage() {
  persistDocuments();
  await persistDatabaseEntity(
    "documents",
    documentStore.map((document) => ({
      ...document,
      tenantId: shipmentStore.find((shipment) => shipment.id === document.shipmentId)?.tenantId ?? "shared"
    }))
  );
}

async function persistInvoicesToStorage() {
  persistInvoices();
  await persistDatabaseEntity("invoices", invoiceStore);
}

async function persistQuotesToStorage() {
  persistQuotes();
  await persistDatabaseEntity("quotes", quoteStore);
}

async function persistCustomersToStorage() {
  await persistDatabaseEntity(
    "customers",
    customerStore.map((customer) => ({
      ...customer,
      id: `${customer.tenantId}:${customer.name}`
    }))
  );
}

let shipmentStore: Shipment[] = loadShipmentStore();
let documentStore: ShipmentDocument[] = loadDocumentStore();
let invoiceStore: InvoiceRecord[] = loadInvoiceStore();
let quoteStore: QuoteRecord[] = loadQuoteStore();
let customerStore = seededCustomers;

function nextShipmentSequence() {
  return shipmentStore.reduce((highest, shipment) => {
    const numericPart = Number(shipment.jobNumber.replace(/\D/g, ""));
    return Number.isNaN(numericPart) ? highest : Math.max(highest, numericPart);
  }, 24022) + 1;
}

function nextQuoteSequence() {
  return quoteStore.reduce((highest, quote) => {
    const numericPart = Number(quote.quoteNumber.replace(/\D/g, ""));
    return Number.isNaN(numericPart) ? highest : Math.max(highest, numericPart);
  }, 24031) + 1;
}

function isQuoteExpired(quote: QuoteRecord) {
  return quote.stage !== "Won" && quote.stage !== "Lost" && new Date(quote.validUntil).getTime() < Date.now();
}

function normalizeQuote(quote: QuoteRecord) {
  if (isQuoteExpired(quote) && quote.status !== "Expired") {
    quote.status = "Expired";
  }

  return quote;
}

function shipmentMatchesScope(shipment: Shipment, tenantId: string, role?: UserRole, customerName?: string) {
  if (shipment.tenantId !== tenantId) {
    return false;
  }

  if (role === "Customer" && customerName) {
    return shipment.customer === customerName;
  }

  return true;
}

function invoiceMatchesScope(invoice: InvoiceRecord, tenantId: string, role?: UserRole, customerName?: string) {
  if (invoice.tenantId !== tenantId) {
    return false;
  }

  if (role === "Customer" && customerName) {
    return invoice.customerName === customerName;
  }

  return true;
}

function quoteMatchesScope(quote: QuoteRecord, tenantId: string, role?: UserRole, customerName?: string) {
  if (quote.tenantId !== tenantId) {
    return false;
  }

  if (role === "Customer" && customerName) {
    return quote.customerName === customerName;
  }

  return true;
}

function shipmentsForScope(tenantId: string, role?: UserRole, customerName?: string) {
  return shipmentStore.filter((shipment) => shipmentMatchesScope(shipment, tenantId, role, customerName));
}

function invoicesForScope(tenantId: string, role?: UserRole, customerName?: string) {
  return invoiceStore.filter((invoice) => invoiceMatchesScope(invoice, tenantId, role, customerName));
}

function quotesForScope(tenantId: string, role?: UserRole, customerName?: string) {
  return quoteStore
    .filter((quote) => quoteMatchesScope(quote, tenantId, role, customerName))
    .map((quote) => normalizeQuote(quote))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function initializePlatformDataPersistence() {
  if (!isDatabasePersistenceEnabled()) {
    return;
  }

  const snapshot = await initializeDatabasePersistence({
    shipments: shipmentStore,
    documents: documentStore,
    invoices: invoiceStore,
    quotes: quoteStore,
    customers: customerStore
  });

  if (!snapshot) {
    return;
  }

  shipmentStore = snapshot.shipments;
  documentStore = snapshot.documents;
  invoiceStore = snapshot.invoices;
  quoteStore = snapshot.quotes;
  customerStore = snapshot.customers;
}

function getInMemoryCounts() {
  return [
    { name: "shipments", count: shipmentStore.length },
    { name: "documents", count: documentStore.length },
    { name: "invoices", count: invoiceStore.length },
    { name: "quotes", count: quoteStore.length },
    { name: "customers", count: customerStore.length }
  ];
}

export async function getPersistenceStatusSummary(): Promise<PersistenceStatus> {
  return getDatabasePersistenceStatus(getInMemoryCounts());
}

export async function syncPlatformDataToDatabase() {
  if (!isDatabasePersistenceEnabled()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await forceSyncDatabasePersistence({
    shipments: shipmentStore,
    documents: documentStore,
    invoices: invoiceStore,
    quotes: quoteStore,
    customers: customerStore
  });

  await persistCustomersToStorage();
  return getPersistenceStatusSummary();
}

export function getDashboardPayload(tenantId: string, role?: UserRole, customerName?: string) {
  const scopedShipments = shipmentsForScope(tenantId, role, customerName);
  const scopedInvoices = invoicesForScope(tenantId, role, customerName);
  const deliveredCount = scopedShipments.filter((shipment) => shipment.stage === "Delivered" || shipment.stage === "Closed").length;
  const docsGenerated = documentStore.filter((document) =>
    scopedShipments.some((shipment) => shipment.id === document.shipmentId)
  ).length;
  const averageMargin = scopedShipments.length
    ? scopedShipments.reduce((sum, shipment) => sum + shipment.marginPercent, 0) / scopedShipments.length
    : 0;
  const outstanding = scopedInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);

  return {
    metrics: [
      {
        label: role === "Customer" ? "Your Shipments" : "Open Shipments",
        value: scopedShipments.length.toLocaleString(),
        trend: `${scopedShipments.filter((shipment) => shipment.stage !== "Closed").length} active jobs in execution`
      },
      {
        label: "Docs Generated",
        value: docsGenerated.toLocaleString(),
        trend: `${Math.max(docsGenerated * 12, 24)} files projected at scale`
      },
      {
        label: role === "Customer" ? "Outstanding Invoices" : "Delivered",
        value: role === "Customer" ? `$${outstanding.toLocaleString()}` : deliveredCount.toLocaleString(),
        trend:
          role === "Customer"
            ? `${scopedInvoices.filter((invoice) => invoice.status !== "Paid").length} invoices awaiting payment`
            : `${Math.max(scopedShipments.length - deliveredCount, 0)} jobs still moving through the pipeline`
      },
      {
        label: role === "Customer" ? "Approved Docs" : "Avg GP",
        value: role === "Customer" ? String(getCustomerDocumentCount(tenantId, role, customerName)) : `${averageMargin.toFixed(1)}%`,
        trend: role === "Customer" ? "Visible in your customer portal" : "Tenant-scoped shipment profitability"
      }
    ],
    recentShipments: scopedShipments.slice(0, 4),
    platform: platformOverview.architecture
  };
}

export function getShipments(tenantId: string, role?: UserRole, customerName?: string) {
  return shipmentsForScope(tenantId, role, customerName);
}

export function getShipmentById(id: string, tenantId: string, role?: UserRole, customerName?: string) {
  return shipmentStore.find(
    (shipment) => shipment.id === id && shipmentMatchesScope(shipment, tenantId, role, customerName)
  ) ?? null;
}

function buildMilestones(shipment: Shipment) {
  const orderedStages: ShipmentStage[] = ["Booking", "Confirmed", "In Transit", "Customs", "Delivered", "Closed"];
  const currentIndex = orderedStages.indexOf(shipment.stage);

  return orderedStages.map((stage, index) => ({
    label: stage,
    status: index < currentIndex ? "Complete" : index === currentIndex ? "Current" : "Upcoming",
    timestamp:
      index <= currentIndex
        ? new Date(Date.now() - (currentIndex - index) * 1000 * 60 * 60 * 9).toISOString()
        : new Date(Date.now() + (index - currentIndex) * 1000 * 60 * 60 * 18).toISOString(),
    owner: shipment.owner
  })) satisfies ShipmentDetail["milestones"];
}

function buildCostLines(shipment: Shipment): ShipmentCostLine[] {
  const baseFreight = Math.round(shipment.weightKg * 0.42);
  const handling = Math.round(shipment.weightKg * 0.05);
  const customs = shipment.stage === "Customs" || shipment.stage === "Delivered" || shipment.stage === "Closed" ? 780 : 420;

  return [
    {
      code: "FRT",
      description: `${shipment.mode} freight sell`,
      sellAmount: baseFreight,
      costAmount: Math.round(baseFreight * (1 - shipment.marginPercent / 100)),
      currency: "USD"
    },
    {
      code: "HDL",
      description: "Handling and documentation",
      sellAmount: handling,
      costAmount: Math.round(handling * 0.72),
      currency: "USD"
    },
    {
      code: "CUS",
      description: "Customs brokerage and filing",
      sellAmount: customs,
      costAmount: Math.round(customs * 0.76),
      currency: "USD"
    }
  ];
}

function buildFlags(shipment: Shipment) {
  const flags = [`Incoterm ${shipment.incoterm}`, `${shipment.mode} routing`];

  if (shipment.containerRef) {
    flags.push(`Container ${shipment.containerRef}`);
  }

  if (shipment.stage === "Customs") {
    flags.push("Broker intervention required");
  }

  if (shipment.marginPercent < 10) {
    flags.push("Low margin alert");
  }

  return flags;
}

export function getShipmentDetailForRole(id: string, tenantId: string, role: UserRole, customerName?: string) {
  const shipment = getShipmentById(id, tenantId, role, customerName);

  if (!shipment) {
    return null;
  }

  const visibleDocuments = documentStore
    .filter((document) => document.shipmentId === id)
    .filter((document) =>
      role === "Customer" ? document.visibleToCustomer && (document.status === "Approved" || document.status === "Signed") : true
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    shipment,
    milestones: buildMilestones(shipment),
    documents: visibleDocuments,
    costLines: role === "Customer" ? [] : buildCostLines(shipment),
    internalNotes:
      role === "Customer"
        ? []
        : [
            `${shipment.owner} owns operational execution for this job.`,
            `${shipment.customer} requires milestone updates on booking confirmation and customs release.`,
            "Document packet should be complete before customer portal exposure."
          ],
    externalNotes: [
      "Booking confirmed and movement plan shared with consignee.",
      "Customer portal can expose approved documents and current milestone state."
    ],
    flags: role === "Customer" ? buildFlags(shipment).filter((flag) => !flag.includes("Low margin")) : buildFlags(shipment)
  } satisfies ShipmentDetail;
}

export async function createShipment(input: CreateShipmentInput, tenantId: string) {
  const shipment: Shipment = {
    id: crypto.randomUUID(),
    tenantId,
    jobNumber: `CC-${nextShipmentSequence()}`,
    stage: "Booking",
    containerRef: undefined,
    ...input
  };

  shipmentStore.unshift(shipment);
  await persistShipmentsToStorage();
  return shipment;
}

export async function updateShipmentStage(id: string, tenantId: string, stage: ShipmentStage) {
  const shipment = shipmentStore.find((item) => item.id === id && item.tenantId === tenantId);

  if (!shipment) {
    return null;
  }

  shipment.stage = stage;
  await persistShipmentsToStorage();
  return shipment;
}

export async function updateShipment(id: string, tenantId: string, input: UpdateShipmentInput) {
  const shipment = shipmentStore.find((item) => item.id === id && item.tenantId === tenantId);

  if (!shipment) {
    return null;
  }

  Object.assign(shipment, input);
  await persistShipmentsToStorage();
  return shipment;
}

export async function deleteShipment(id: string, tenantId: string) {
  const index = shipmentStore.findIndex((item) => item.id === id && item.tenantId === tenantId);

  if (index === -1) {
    return null;
  }

  const [deleted] = shipmentStore.splice(index, 1);
  documentStore.splice(
    0,
    documentStore.length,
    ...documentStore.filter((document) => document.shipmentId !== id)
  );
  invoiceStore.splice(
    0,
    invoiceStore.length,
    ...invoiceStore.filter((invoice) => invoice.shipmentId !== id)
  );
  quoteStore.forEach((quote) => {
    if (quote.convertedShipmentId === id) {
      quote.convertedShipmentId = undefined;
      if (quote.stage === "Won") {
        quote.stage = "Quoted";
        quote.status = isQuoteExpired(quote) ? "Expired" : "Sent";
      }
    }
  });
  await persistShipmentsToStorage();
  await persistDocumentsToStorage();
  await persistInvoicesToStorage();
  await persistQuotesToStorage();
  return deleted;
}

export async function addShipmentDocument(shipmentId: string, tenantId: string, input: CreateShipmentDocumentInput, uploadedBy: string) {
  const shipment = getShipmentById(shipmentId, tenantId);

  if (!shipment) {
    return null;
  }

  const now = new Date().toISOString();
  const document: ShipmentDocument = {
    id: `DOC-${Date.now()}`,
    shipmentId,
    type: input.type,
    fileName: input.fileName,
    status: "Ready",
    uploadedBy,
    updatedAt: now,
    source: input.source,
    currentVersion: 1,
    visibleToCustomer: false,
    versions: [
      {
        version: 1,
        fileName: input.fileName,
        updatedAt: now,
        uploadedBy,
        notes: "Initial issue created in CargoClear."
      }
    ]
  };

  documentStore.unshift(document);
  await persistDocumentsToStorage();
  return document;
}

function findDocument(documentId: string, shipmentId: string) {
  return documentStore.find((document) => document.id === documentId && document.shipmentId === shipmentId) ?? null;
}

export async function updateShipmentDocument(
  shipmentId: string,
  tenantId: string,
  documentId: string,
  input: UpdateShipmentDocumentInput
) {
  const shipment = getShipmentById(shipmentId, tenantId);

  if (!shipment) {
    return null;
  }

  const document = findDocument(documentId, shipmentId);

  if (!document) {
    return null;
  }

  if (typeof input.visibleToCustomer === "boolean") {
    document.visibleToCustomer = input.visibleToCustomer;
  }

  if (input.status) {
    document.status = input.status;
  }

  document.updatedAt = new Date().toISOString();
  await persistDocumentsToStorage();
  return document;
}

export async function addShipmentDocumentVersion(
  shipmentId: string,
  tenantId: string,
  documentId: string,
  input: CreateShipmentDocumentVersionInput,
  uploadedBy: string
) {
  const shipment = getShipmentById(shipmentId, tenantId);

  if (!shipment) {
    return null;
  }

  const document = findDocument(documentId, shipmentId);

  if (!document) {
    return null;
  }

  const nextVersion = document.currentVersion + 1;
  const now = new Date().toISOString();

  document.currentVersion = nextVersion;
  document.fileName = input.fileName;
  document.uploadedBy = uploadedBy;
  document.updatedAt = now;
  document.status = "Ready";
  document.visibleToCustomer = false;
  document.versions.unshift({
    version: nextVersion,
    fileName: input.fileName,
    updatedAt: now,
    uploadedBy,
    notes: input.notes
  });

  await persistDocumentsToStorage();
  return document;
}

export function getCustomerDocumentCount(tenantId: string, role?: UserRole, customerName?: string) {
  const scopedShipmentIds = new Set(shipmentsForScope(tenantId, role, customerName).map((shipment) => shipment.id));

  return documentStore.filter(
    (document) =>
      scopedShipmentIds.has(document.shipmentId) &&
      document.visibleToCustomer &&
      (document.status === "Approved" || document.status === "Signed")
  ).length;
}

export function getInvoices(tenantId: string, role?: UserRole, customerName?: string) {
  return invoicesForScope(tenantId, role, customerName).sort((left, right) => right.issuedAt.localeCompare(left.issuedAt));
}

export function getInvoiceById(id: string, tenantId: string, role?: UserRole, customerName?: string) {
  return invoiceStore.find((invoice) => invoice.id === id && invoiceMatchesScope(invoice, tenantId, role, customerName)) ?? null;
}

export function getQuotes(tenantId: string, role?: UserRole, customerName?: string) {
  const scopedQuotes = quotesForScope(tenantId, role, customerName);

  if (scopedQuotes.some((quote) => quote.status === "Expired")) {
    persistQuotes();
  }

  return scopedQuotes;
}

export function getQuoteById(id: string, tenantId: string, role?: UserRole, customerName?: string) {
  const quote = quoteStore.find((item) => item.id === id && quoteMatchesScope(item, tenantId, role, customerName)) ?? null;

  if (!quote) {
    return null;
  }

  return normalizeQuote(quote);
}

export async function createQuote(input: CreateQuoteInput, tenantId: string) {
  const quote: QuoteRecord = {
    id: crypto.randomUUID(),
    tenantId,
    quoteNumber: `QT-${nextQuoteSequence()}`,
    stage: "Quoted",
    status: "Draft",
    createdAt: new Date().toISOString(),
    ...input
  };

  quoteStore.unshift(normalizeQuote(quote));
  await persistQuotesToStorage();
  return quote;
}

export async function updateQuoteStage(
  id: string,
  tenantId: string,
  stage: QuoteStage,
  role?: UserRole,
  customerName?: string
) {
  const quote = quoteStore.find((item) => item.id === id && quoteMatchesScope(item, tenantId, role, customerName));

  if (!quote) {
    return null;
  }

  quote.stage = stage;

  if (stage === "Won") {
    quote.status = "Approved";
  } else if (stage === "Lost") {
    quote.status = "Expired";
  } else if (quote.status === "Expired") {
    quote.status = "Sent";
  } else if (quote.status === "Draft") {
    quote.status = "Sent";
  }

  normalizeQuote(quote);
  await persistQuotesToStorage();
  return quote;
}

export async function convertQuoteToShipment(id: string, tenantId: string) {
  const quote = quoteStore.find((item) => item.id === id && item.tenantId === tenantId);

  if (!quote) {
    return null;
  }

  if (quote.convertedShipmentId) {
    return getShipmentById(quote.convertedShipmentId, tenantId);
  }

  const shipment = await createShipment(
    {
      customer: quote.customerName,
      mode: quote.mode,
      origin: quote.origin,
      destination: quote.destination,
      incoterm: quote.incoterm,
      owner: quote.owner,
      weightKg: quote.estimatedWeightKg,
      marginPercent: quote.expectedMarginPercent
    },
    tenantId
  );

  quote.stage = "Won";
  quote.status = "Approved";
  quote.convertedShipmentId = shipment.id;
  await persistQuotesToStorage();
  return shipment;
}

export async function recordInvoicePayment(id: string, tenantId: string, amount: number, role?: UserRole, customerName?: string) {
  const invoice = invoiceStore.find((item) => item.id === id && invoiceMatchesScope(item, tenantId, role, customerName));

  if (!invoice) {
    return null;
  }

  invoice.paidAmount = Math.min(invoice.totalAmount, invoice.paidAmount + amount);

  if (invoice.paidAmount <= 0) {
    invoice.status = "Issued";
  } else if (invoice.paidAmount >= invoice.totalAmount) {
    invoice.status = "Paid";
  } else {
    invoice.status = "Partially Paid";
  }

  await persistInvoicesToStorage();
  return invoice;
}

export function getFinanceSummaryForScope(tenantId: string, role?: UserRole, customerName?: string): FinanceSummary {
  const scopedInvoices = invoicesForScope(tenantId, role, customerName);
  const outstanding = scopedInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
  const partialCount = scopedInvoices.filter((invoice) => invoice.status === "Partially Paid").length;
  const overdueCount = scopedInvoices.filter((invoice) => invoice.status === "Overdue").length;

  if (role === "Customer") {
    return {
      receivables: [
        { label: "Open balance", value: `$${outstanding.toLocaleString()}`, trend: `${scopedInvoices.length} customer invoices in your portal` },
        { label: "Partially paid", value: String(partialCount), trend: "Invoices with partial settlement recorded" },
        { label: "Overdue", value: String(overdueCount), trend: "Invoices beyond due date requiring action" }
      ],
      payables: [],
      marginAlerts: []
    };
  }

  return {
    ...financeSummary,
    receivables: [
      { label: "Outstanding AR", value: `$${outstanding.toLocaleString()}`, trend: `${scopedInvoices.filter((invoice) => invoice.status !== "Paid").length} invoices open` },
      { label: "Partially Paid", value: String(partialCount), trend: "Customer settlements in progress" },
      { label: "Overdue", value: String(overdueCount), trend: "Collections follow-up active" }
    ]
  };
}

export function getComplianceQueue() {
  return complianceQueue;
}

export function getWarehouseTasks() {
  return warehouseTasks;
}

export function getCustomers(tenantId: string, role?: UserRole, customerName?: string) {
  return customerStore.filter((customer) => {
    if (customer.tenantId !== tenantId) {
      return false;
    }

    if (role === "Customer" && customerName) {
      return customer.name === customerName;
    }

    return true;
  });
}

export function getTenantConfig(tenantId: string) {
  return tenants.find((tenant) => tenant.id === tenantId) ?? null;
}

export function getPlatformOverview() {
  return platformOverview;
}
