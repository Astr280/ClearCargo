export type ShipmentStage = "Booking" | "Confirmed" | "In Transit" | "Customs" | "Delivered" | "Closed";

export interface Shipment {
  id: string;
  tenantId: string;
  jobNumber: string;
  mode: "Ocean" | "Air" | "Road" | "Rail" | "Multimodal";
  stage: ShipmentStage;
  customer: string;
  origin: string;
  destination: string;
  incoterm: string;
  owner: string;
  weightKg: number;
  containerRef?: string;
  marginPercent: number;
}

export interface CreateShipmentInput {
  customer: string;
  mode: Shipment["mode"];
  origin: string;
  destination: string;
  incoterm: string;
  owner: string;
  weightKg: number;
  marginPercent: number;
}

export interface UpdateShipmentStageInput {
  stage: ShipmentStage;
}

export interface UpdateShipmentInput extends CreateShipmentInput {
  stage: ShipmentStage;
  containerRef?: string;
}

export type ShipmentDocumentType =
  | "Commercial Invoice"
  | "Packing List"
  | "Air Waybill"
  | "House Bill"
  | "Customs Entry"
  | "Delivery Order";

export type ShipmentDocumentStatus = "Draft" | "Ready" | "Approved" | "Signed";

export interface ShipmentDocumentVersion {
  version: number;
  fileName: string;
  updatedAt: string;
  uploadedBy: string;
  notes?: string;
}

export interface ShipmentDocument {
  id: string;
  shipmentId: string;
  type: ShipmentDocumentType;
  fileName: string;
  status: ShipmentDocumentStatus;
  uploadedBy: string;
  updatedAt: string;
  source: "Generated" | "Uploaded";
  currentVersion: number;
  visibleToCustomer: boolean;
  versions: ShipmentDocumentVersion[];
}

export interface ShipmentMilestone {
  label: string;
  status: "Complete" | "Current" | "Upcoming";
  timestamp: string;
  owner: string;
}

export interface ShipmentCostLine {
  code: string;
  description: string;
  sellAmount: number;
  costAmount: number;
  currency: "USD" | "EUR" | "GBP" | "CNY" | "AUD";
}

export interface ShipmentDetail {
  shipment: Shipment;
  milestones: ShipmentMilestone[];
  documents: ShipmentDocument[];
  costLines: ShipmentCostLine[];
  internalNotes: string[];
  externalNotes: string[];
  flags: string[];
}

export interface CreateShipmentDocumentInput {
  type: ShipmentDocumentType;
  fileName: string;
  source: ShipmentDocument["source"];
  uploadedBy: string;
}

export interface UpdateShipmentDocumentInput {
  status?: ShipmentDocumentStatus;
  visibleToCustomer?: boolean;
}

export interface CreateShipmentDocumentVersionInput {
  fileName: string;
  notes?: string;
}

export type UserRole =
  | "Freight Coordinator"
  | "Customs Broker"
  | "Finance / Billing"
  | "Warehouse Manager"
  | "Operations Manager"
  | "System Admin"
  | "Customer";

export type ModuleKey = "dashboard" | "shipments" | "compliance" | "finance" | "warehouse" | "customers" | "platform";

export interface TenantBranding {
  companyName: string;
  logoMode: "mark" | "initials";
  initials: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: TenantBranding;
  enabledModules: ModuleKey[];
}

export interface AppUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  customerName?: string;
}

export interface AuthSession {
  token: string;
  user: AppUser;
  tenant: TenantConfig;
  mfaVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  session?: AuthSession;
  mfaRequired?: boolean;
  challenge?: {
    email: string;
    role: UserRole;
    tenantName: string;
  };
  message?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
}

export interface ComplianceQueueItem {
  id: string;
  type: string;
  jurisdiction: string;
  priority: "Low" | "Medium" | "High";
  status: string;
}

export interface FinanceSummary {
  receivables: DashboardMetric[];
  payables: DashboardMetric[];
  marginAlerts: Array<{ jobNumber: string; message: string }>;
}

export type InvoiceStatus = "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue";

export interface InvoiceLineItem {
  code: string;
  description: string;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  shipmentId: string;
  invoiceNumber: string;
  customerName: string;
  currency: "USD" | "EUR" | "GBP" | "CNY" | "AUD";
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  paidAmount: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
}

export interface CustomerContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface SalesActivityRecord {
  id: string;
  type: "Call" | "Email" | "Meeting";
  subject: string;
  happenedAt: string;
  owner: string;
}

export type QuoteStage = "Lead" | "Quoted" | "Won" | "Lost";
export type QuoteStatus = "Draft" | "Sent" | "Approved" | "Expired";

export interface QuoteLineItem {
  code: string;
  description: string;
  amount: number;
}

export interface QuoteRecord {
  id: string;
  tenantId: string;
  quoteNumber: string;
  customerName: string;
  contactName: string;
  lane: string;
  mode: Shipment["mode"];
  origin: string;
  destination: string;
  incoterm: string;
  owner: string;
  stage: QuoteStage;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  estimatedWeightKg: number;
  expectedMarginPercent: number;
  notes?: string;
  lineItems: QuoteLineItem[];
  convertedShipmentId?: string;
}

export interface CreateQuoteInput {
  customerName: string;
  contactName: string;
  lane: string;
  mode: Shipment["mode"];
  origin: string;
  destination: string;
  incoterm: string;
  owner: string;
  validUntil: string;
  estimatedWeightKg: number;
  expectedMarginPercent: number;
  notes?: string;
  lineItems: QuoteLineItem[];
}

export interface WarehouseTask {
  id: string;
  type: string;
  location: string;
  assignedTo: string;
  status: string;
}

export interface CustomerAccount {
  tenantId: string;
  name: string;
  lane: string;
  creditTerms: string;
  quoteStage: string;
  openShipments: number;
  preferredCarriers: string[];
  contacts: CustomerContact[];
  activities: SalesActivityRecord[];
}

export interface PlatformOverview {
  architecture: DashboardMetric[];
  integrations: Array<{ name: string; phase: string; method: string }>;
  tenancy: string[];
}

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Open Shipments", value: "1,248", trend: "+6.4% month over month" },
  { label: "Docs Generated", value: "18,420", trend: "96% automated" },
  { label: "Customs Error Rate", value: "0.4%", trend: "Below 0.5% target" },
  { label: "Gross Profit", value: "$412K", trend: "+15.7% above target" }
];

export const shipments: Shipment[] = [
  {
    id: "1",
    tenantId: "tenant-cargoclear",
    jobNumber: "CC-24018",
    mode: "Ocean",
    stage: "Booking",
    customer: "Northwind Imports",
    origin: "Shenzhen",
    destination: "Long Beach",
    incoterm: "FOB",
    owner: "A. Mehta",
    weightKg: 18400,
    containerRef: "MSKU-884120",
    marginPercent: 18.2
  },
  {
    id: "2",
    tenantId: "tenant-cargoclear",
    jobNumber: "CC-24022",
    mode: "Air",
    stage: "Confirmed",
    customer: "BluePeak Pharma",
    origin: "Frankfurt",
    destination: "Chicago",
    incoterm: "DAP",
    owner: "J. Patel",
    weightKg: 1260,
    marginPercent: 10.8
  },
  {
    id: "3",
    tenantId: "tenant-atlas",
    jobNumber: "CC-23967",
    mode: "Ocean",
    stage: "In Transit",
    customer: "Atlas Retail Group",
    origin: "Singapore",
    destination: "Los Angeles",
    incoterm: "CIF",
    owner: "N. Thomas",
    weightKg: 22300,
    containerRef: "OOLU-101882",
    marginPercent: 16.1
  },
  {
    id: "4",
    tenantId: "tenant-cargoclear",
    jobNumber: "CC-23951",
    mode: "Ocean",
    stage: "Customs",
    customer: "Frontier Auto Parts",
    origin: "Busan",
    destination: "Houston",
    incoterm: "DDP",
    owner: "D. Shah",
    weightKg: 19120,
    containerRef: "HLCU-229120",
    marginPercent: 8.1
  }
];

export const complianceQueue: ComplianceQueueItem[] = [
  { id: "CMP-001", type: "ISF 10+2", jurisdiction: "US", priority: "High", status: "Pending filing" },
  { id: "CMP-002", type: "CBP 7501", jurisdiction: "US", priority: "High", status: "Draft generated" },
  { id: "CMP-003", type: "Restricted party screening", jurisdiction: "Global", priority: "Medium", status: "Review required" },
  { id: "CMP-004", type: "Certificate of origin", jurisdiction: "EU", priority: "Low", status: "Awaiting customer upload" }
];

export const financeSummary: FinanceSummary = {
  receivables: [
    { label: "Outstanding AR", value: "$182K", trend: "31 invoices open" },
    { label: "30-60 Days", value: "$51K", trend: "2 enterprise accounts" },
    { label: "90+ Days", value: "$14K", trend: "Collections follow-up active" }
  ],
  payables: [
    { label: "Outstanding AP", value: "$131K", trend: "12 carrier invoices pending" },
    { label: "Unbilled Accruals", value: "$23K", trend: "Awaiting vendor cost capture" },
    { label: "FX Variance", value: "1.8%", trend: "Live feed enabled" }
  ],
  marginAlerts: [
    { jobNumber: "CC-23951", message: "Customs rework reduced GP below threshold." },
    { jobNumber: "CC-24022", message: "DG handling costs compressed airway margin." }
  ]
};

export const warehouseTasks: WarehouseTask[] = [
  { id: "WMS-100", type: "Inbound receipt", location: "Zone A / Bay 04", assignedTo: "Warehouse Team 1", status: "In progress" },
  { id: "WMS-101", type: "Put-away", location: "Cold Room / Bin 12", assignedTo: "Warehouse Team 2", status: "Queued" },
  { id: "WMS-102", type: "Pick & pack", location: "Zone C / Pick Face 09", assignedTo: "Warehouse Team 3", status: "Ready" }
];

export const customers: CustomerAccount[] = [
  {
    tenantId: "tenant-cargoclear",
    name: "Northwind Imports",
    lane: "CN -> US",
    creditTerms: "45 days",
    quoteStage: "Won",
    openShipments: 14,
    preferredCarriers: ["Maersk", "CMA CGM"],
    contacts: [
      { name: "Elena Morris", role: "Import Manager", email: "elena@northwind.example", phone: "+1 310 555 0184" },
      { name: "Jordan Pike", role: "Procurement", email: "jordan@northwind.example", phone: "+1 310 555 0149" }
    ],
    activities: [
      { id: "ACT-1001", type: "Call", subject: "Reviewed Q2 China consolidation lanes", happenedAt: "2026-03-21T16:00:00.000Z", owner: "A. Mehta" },
      { id: "ACT-1002", type: "Email", subject: "Shared revised ocean quote with THC breakout", happenedAt: "2026-03-23T09:15:00.000Z", owner: "A. Mehta" }
    ]
  },
  {
    tenantId: "tenant-cargoclear",
    name: "BluePeak Pharma",
    lane: "DE -> US",
    creditTerms: "30 days",
    quoteStage: "Quoted",
    openShipments: 5,
    preferredCarriers: ["Lufthansa Cargo", "Qatar Airways Cargo"],
    contacts: [
      { name: "Sonia Weber", role: "Logistics Lead", email: "sonia@bluepeak.example", phone: "+49 69 555 0144" },
      { name: "Liam Boyd", role: "QA Distribution", email: "liam@bluepeak.example", phone: "+1 312 555 0160" }
    ],
    activities: [
      { id: "ACT-1003", type: "Meeting", subject: "Reviewed temperature-control SOP for urgent uplift", happenedAt: "2026-03-22T13:00:00.000Z", owner: "J. Patel" }
    ]
  },
  {
    tenantId: "tenant-cargoclear",
    name: "Frontier Auto Parts",
    lane: "KR -> US",
    creditTerms: "60 days",
    quoteStage: "Won",
    openShipments: 8,
    preferredCarriers: ["Hapag-Lloyd", "Hyundai Merchant Marine"],
    contacts: [
      { name: "Marcus Lee", role: "Supply Chain Director", email: "marcus@frontier.example", phone: "+1 713 555 0192" }
    ],
    activities: [
      { id: "ACT-1004", type: "Email", subject: "Sent customs escalation summary for Houston entry", happenedAt: "2026-03-24T18:40:00.000Z", owner: "D. Shah" }
    ]
  },
  {
    tenantId: "tenant-atlas",
    name: "Atlas Retail Group",
    lane: "SG -> US",
    creditTerms: "30 days",
    quoteStage: "Won",
    openShipments: 3,
    preferredCarriers: ["OOCL", "COSCO"],
    contacts: [
      { name: "Maya Lewis", role: "Import Supervisor", email: "maya@atlas.example", phone: "+1 213 555 0127" }
    ],
    activities: [
      { id: "ACT-1005", type: "Email", subject: "Portal activation and invoice handover", happenedAt: "2026-03-20T08:30:00.000Z", owner: "N. Thomas" }
    ]
  }
];

export const quotes: QuoteRecord[] = [
  {
    id: "Q-1",
    tenantId: "tenant-cargoclear",
    quoteNumber: "QT-24031",
    customerName: "BluePeak Pharma",
    contactName: "Sonia Weber",
    lane: "DE -> US",
    mode: "Air",
    origin: "Frankfurt",
    destination: "Chicago",
    incoterm: "DAP",
    owner: "J. Patel",
    stage: "Quoted",
    status: "Sent",
    validUntil: "2026-03-30T00:00:00.000Z",
    createdAt: "2026-03-24T08:30:00.000Z",
    estimatedWeightKg: 980,
    expectedMarginPercent: 13.4,
    notes: "Urgent pharma lane with DG handling and passive cooling.",
    lineItems: [
      { code: "FRT", description: "Air freight", amount: 5200 },
      { code: "DGD", description: "DG handling", amount: 900 },
      { code: "DOC", description: "Export documentation", amount: 450 }
    ]
  },
  {
    id: "Q-2",
    tenantId: "tenant-cargoclear",
    quoteNumber: "QT-24029",
    customerName: "Northwind Imports",
    contactName: "Elena Morris",
    lane: "CN -> US",
    mode: "Ocean",
    origin: "Ningbo",
    destination: "Long Beach",
    incoterm: "FOB",
    owner: "A. Mehta",
    stage: "Lead",
    status: "Draft",
    validUntil: "2026-04-04T00:00:00.000Z",
    createdAt: "2026-03-22T10:00:00.000Z",
    estimatedWeightKg: 16000,
    expectedMarginPercent: 17.8,
    notes: "Introductory lane pricing for spring replenishment volumes.",
    lineItems: [
      { code: "FRT", description: "Ocean freight", amount: 7800 },
      { code: "THC", description: "Terminal handling", amount: 1120 },
      { code: "DOC", description: "Documentation", amount: 530 }
    ]
  },
  {
    id: "Q-3",
    tenantId: "tenant-cargoclear",
    quoteNumber: "QT-24012",
    customerName: "Frontier Auto Parts",
    contactName: "Marcus Lee",
    lane: "KR -> US",
    mode: "Ocean",
    origin: "Busan",
    destination: "Houston",
    incoterm: "DDP",
    owner: "D. Shah",
    stage: "Won",
    status: "Approved",
    validUntil: "2026-03-18T00:00:00.000Z",
    createdAt: "2026-03-10T12:30:00.000Z",
    estimatedWeightKg: 18200,
    expectedMarginPercent: 11.2,
    notes: "Converted to operational job after customs and drayage scope approval.",
    convertedShipmentId: "4",
    lineItems: [
      { code: "FRT", description: "Ocean freight", amount: 8450 },
      { code: "CUS", description: "Customs brokerage", amount: 820 },
      { code: "DRY", description: "Drayage", amount: 1180 }
    ]
  },
  {
    id: "Q-4",
    tenantId: "tenant-atlas",
    quoteNumber: "QT-23988",
    customerName: "Atlas Retail Group",
    contactName: "Maya Lewis",
    lane: "SG -> US",
    mode: "Ocean",
    origin: "Singapore",
    destination: "Los Angeles",
    incoterm: "CIF",
    owner: "N. Thomas",
    stage: "Won",
    status: "Approved",
    validUntil: "2026-03-01T00:00:00.000Z",
    createdAt: "2026-02-25T09:45:00.000Z",
    estimatedWeightKg: 22000,
    expectedMarginPercent: 15.5,
    notes: "Awarded annual replenishment lane for West Coast retail distribution.",
    convertedShipmentId: "3",
    lineItems: [
      { code: "FRT", description: "Ocean freight", amount: 9900 },
      { code: "THC", description: "Terminal handling", amount: 1480 },
      { code: "DOC", description: "Documentation", amount: 620 }
    ]
  }
];

export const platformOverview: PlatformOverview = {
  architecture: [
    { label: "Frontend", value: "React + TypeScript", trend: "Module-driven UX" },
    { label: "API", value: "Node + TypeScript", trend: "REST-first service layout" },
    { label: "Database", value: "PostgreSQL", trend: "Schema-per-tenant ready" },
    { label: "Queue / Cache", value: "Redis + workers", trend: "Planned for docs and OCR" }
  ],
  integrations: [
    { name: "US CBP / ACE", phase: "Phase 1", method: "EDI X12 / ANSI" },
    { name: "IATA CargoIS", phase: "Phase 1", method: "REST API" },
    { name: "Stripe", phase: "Phase 1", method: "REST API" },
    { name: "DocuSign", phase: "Phase 1", method: "REST API" },
    { name: "QuickBooks / Xero", phase: "Phase 2", method: "REST API" }
  ],
  tenancy: [
    "Tenant-specific schemas or isolated databases",
    "White-label logo, colors, and domains",
    "Feature flags for WMS, CRM, analytics, and integrations",
    "Usage billing by jobs, users, and stored documents"
  ]
};

export const shipmentDocuments: ShipmentDocument[] = [
  {
    id: "DOC-1001",
    shipmentId: "1",
    type: "Commercial Invoice",
    fileName: "CC-24018-commercial-invoice.pdf",
    status: "Approved",
    uploadedBy: "A. Mehta",
    updatedAt: "2026-03-21T09:15:00.000Z",
    source: "Generated",
    currentVersion: 2,
    visibleToCustomer: true,
    versions: [
      {
        version: 1,
        fileName: "CC-24018-commercial-invoice-v1.pdf",
        updatedAt: "2026-03-20T11:10:00.000Z",
        uploadedBy: "A. Mehta",
        notes: "Initial draft from shipment cost sheet."
      },
      {
        version: 2,
        fileName: "CC-24018-commercial-invoice.pdf",
        updatedAt: "2026-03-21T09:15:00.000Z",
        uploadedBy: "A. Mehta",
        notes: "Approved customer-facing issue."
      }
    ]
  },
  {
    id: "DOC-1002",
    shipmentId: "1",
    type: "Packing List",
    fileName: "CC-24018-packing-list.pdf",
    status: "Ready",
    uploadedBy: "A. Mehta",
    updatedAt: "2026-03-21T09:18:00.000Z",
    source: "Generated",
    currentVersion: 1,
    visibleToCustomer: false,
    versions: [
      {
        version: 1,
        fileName: "CC-24018-packing-list.pdf",
        updatedAt: "2026-03-21T09:18:00.000Z",
        uploadedBy: "A. Mehta",
        notes: "Pending review before portal exposure."
      }
    ]
  },
  {
    id: "DOC-1003",
    shipmentId: "2",
    type: "Air Waybill",
    fileName: "CC-24022-eawb.pdf",
    status: "Approved",
    uploadedBy: "J. Patel",
    updatedAt: "2026-03-22T05:20:00.000Z",
    source: "Generated",
    currentVersion: 3,
    visibleToCustomer: true,
    versions: [
      {
        version: 1,
        fileName: "CC-24022-eawb-draft.pdf",
        updatedAt: "2026-03-21T23:10:00.000Z",
        uploadedBy: "J. Patel",
        notes: "Initial airway bill draft."
      },
      {
        version: 2,
        fileName: "CC-24022-eawb-review.pdf",
        updatedAt: "2026-03-22T03:00:00.000Z",
        uploadedBy: "J. Patel",
        notes: "Carrier corrections applied."
      },
      {
        version: 3,
        fileName: "CC-24022-eawb.pdf",
        updatedAt: "2026-03-22T05:20:00.000Z",
        uploadedBy: "J. Patel",
        notes: "Approved final issue."
      }
    ]
  },
  {
    id: "DOC-1004",
    shipmentId: "4",
    type: "Customs Entry",
    fileName: "CC-23951-cbp-7501.pdf",
    status: "Draft",
    uploadedBy: "D. Shah",
    updatedAt: "2026-03-22T19:45:00.000Z",
    source: "Generated",
    currentVersion: 1,
    visibleToCustomer: false,
    versions: [
      {
        version: 1,
        fileName: "CC-23951-cbp-7501.pdf",
        updatedAt: "2026-03-22T19:45:00.000Z",
        uploadedBy: "D. Shah",
        notes: "Draft filing package awaiting broker review."
      }
    ]
  }
];

export const tenants: TenantConfig[] = [
  {
    id: "tenant-cargoclear",
    name: "CargoClear HQ",
    domain: "hq.cargoclear.local",
    branding: {
      companyName: "CargoClear",
      logoMode: "mark",
      initials: "CC",
      primaryColor: "#0f4fbf",
      secondaryColor: "#16a4c9",
      accentColor: "#0b1d3a"
    },
    enabledModules: ["dashboard", "shipments", "compliance", "finance", "warehouse", "customers", "platform"]
  },
  {
    id: "tenant-atlas",
    name: "Atlas NVO",
    domain: "atlas.cargoclear.local",
    branding: {
      companyName: "Atlas NVO",
      logoMode: "initials",
      initials: "AN",
      primaryColor: "#0a6c74",
      secondaryColor: "#d98b2b",
      accentColor: "#0f2431"
    },
    enabledModules: ["dashboard", "shipments", "customers"]
  }
];

export const invoices: InvoiceRecord[] = [
  {
    id: "INV-1",
    tenantId: "tenant-cargoclear",
    shipmentId: "1",
    invoiceNumber: "AR-24018",
    customerName: "Northwind Imports",
    currency: "USD",
    status: "Issued",
    dueDate: "2026-04-02T00:00:00.000Z",
    issuedAt: "2026-03-23T08:00:00.000Z",
    paidAmount: 0,
    totalAmount: 11450,
    lineItems: [
      { code: "FRT", description: "Ocean freight", amount: 8400 },
      { code: "CUS", description: "Customs brokerage", amount: 780 },
      { code: "HDL", description: "Handling and docs", amount: 2270 }
    ]
  },
  {
    id: "INV-2",
    tenantId: "tenant-cargoclear",
    shipmentId: "2",
    invoiceNumber: "AR-24022",
    customerName: "BluePeak Pharma",
    currency: "USD",
    status: "Partially Paid",
    dueDate: "2026-03-29T00:00:00.000Z",
    issuedAt: "2026-03-20T14:00:00.000Z",
    paidAmount: 4200,
    totalAmount: 6900,
    lineItems: [
      { code: "FRT", description: "Air freight", amount: 5100 },
      { code: "DGD", description: "DG handling", amount: 950 },
      { code: "DOC", description: "Documentation", amount: 850 }
    ]
  },
  {
    id: "INV-3",
    tenantId: "tenant-atlas",
    shipmentId: "3",
    invoiceNumber: "AR-23967",
    customerName: "Atlas Retail Group",
    currency: "USD",
    status: "Overdue",
    dueDate: "2026-03-15T00:00:00.000Z",
    issuedAt: "2026-03-01T09:00:00.000Z",
    paidAmount: 0,
    totalAmount: 12880,
    lineItems: [
      { code: "FRT", description: "Ocean freight", amount: 9950 },
      { code: "THC", description: "Terminal handling", amount: 1640 },
      { code: "DOC", description: "Documentation", amount: 1290 }
    ]
  }
];
