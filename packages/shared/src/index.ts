export type ShipmentStage = "Booking" | "Confirmed" | "In Transit" | "Customs" | "Delivered" | "Closed";

export interface Shipment {
  id: string;
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
  { name: "Northwind Imports", lane: "CN -> US", creditTerms: "45 days", quoteStage: "Won", openShipments: 14 },
  { name: "BluePeak Pharma", lane: "DE -> US", creditTerms: "30 days", quoteStage: "Quoted", openShipments: 5 },
  { name: "Frontier Auto Parts", lane: "KR -> US", creditTerms: "60 days", quoteStage: "Won", openShipments: 8 }
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
