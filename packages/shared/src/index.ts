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
    customer: "Northwind Imports",
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
    openShipments: 14
  },
  {
    tenantId: "tenant-cargoclear",
    name: "BluePeak Pharma",
    lane: "DE -> US",
    creditTerms: "30 days",
    quoteStage: "Quoted",
    openShipments: 5
  },
  {
    tenantId: "tenant-cargoclear",
    name: "Frontier Auto Parts",
    lane: "KR -> US",
    creditTerms: "60 days",
    quoteStage: "Won",
    openShipments: 8
  },
  {
    tenantId: "tenant-atlas",
    name: "Atlas Retail Group",
    lane: "SG -> US",
    creditTerms: "30 days",
    quoteStage: "Won",
    openShipments: 3
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
