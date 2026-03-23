import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  complianceQueue,
  type CreateShipmentDocumentVersionInput,
  type CreateShipmentDocumentInput,
  type CreateShipmentInput,
  customers,
  financeSummary,
  platformOverview,
  shipments,
  shipmentDocuments,
  type ShipmentCostLine,
  type ShipmentDetail,
  type ShipmentDocument,
  type ShipmentDocumentStatus,
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

const shipmentStore: Shipment[] = loadShipmentStore();
const documentStore: ShipmentDocument[] = loadDocumentStore();

function shipmentsForTenant(tenantId: string) {
  return shipmentStore.filter((shipment) => shipment.tenantId === tenantId);
}

function nextShipmentSequence() {
  return shipmentStore.reduce((highest, shipment) => {
    const numericPart = Number(shipment.jobNumber.replace(/\D/g, ""));
    return Number.isNaN(numericPart) ? highest : Math.max(highest, numericPart);
  }, 24022) + 1;
}

export function getDashboardPayload(tenantId: string) {
  const tenantShipments = shipmentsForTenant(tenantId);
  const deliveredCount = tenantShipments.filter((shipment) => shipment.stage === "Delivered" || shipment.stage === "Closed").length;
  const docsGenerated = documentStore.filter((document) =>
    tenantShipments.some((shipment) => shipment.id === document.shipmentId)
  ).length;
  const averageMargin = tenantShipments.length
    ? tenantShipments.reduce((sum, shipment) => sum + shipment.marginPercent, 0) / tenantShipments.length
    : 0;

  return {
    metrics: [
      {
        label: "Open Shipments",
        value: tenantShipments.length.toLocaleString(),
        trend: `${tenantShipments.filter((shipment) => shipment.stage !== "Closed").length} active jobs in execution`
      },
      {
        label: "Docs Generated",
        value: docsGenerated.toLocaleString(),
        trend: `${Math.max(docsGenerated * 12, 24)} files projected at scale`
      },
      {
        label: "Delivered",
        value: deliveredCount.toLocaleString(),
        trend: `${Math.max(tenantShipments.length - deliveredCount, 0)} jobs still moving through the pipeline`
      },
      {
        label: "Avg GP",
        value: `${averageMargin.toFixed(1)}%`,
        trend: "Tenant-scoped shipment profitability"
      }
    ],
    recentShipments: tenantShipments.slice(0, 4),
    platform: platformOverview.architecture
  };
}

export function getShipments(tenantId: string) {
  return shipmentsForTenant(tenantId);
}

export function getShipmentById(id: string, tenantId: string) {
  return shipmentStore.find((item) => item.id === id && item.tenantId === tenantId) ?? null;
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

export function getShipmentDetail(id: string, tenantId: string) {
  return getShipmentDetailForRole(id, tenantId, "System Admin");
}

export function getShipmentDetailForRole(id: string, tenantId: string, role: UserRole) {
  const shipment = getShipmentById(id, tenantId);

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

export function createShipment(input: CreateShipmentInput, tenantId: string) {
  const shipment: Shipment = {
    id: crypto.randomUUID(),
    tenantId,
    jobNumber: `CC-${nextShipmentSequence()}`,
    stage: "Booking",
    containerRef: undefined,
    ...input
  };

  shipmentStore.unshift(shipment);
  persistShipments();
  return shipment;
}

export function updateShipmentStage(id: string, tenantId: string, stage: ShipmentStage) {
  const shipment = shipmentStore.find((item) => item.id === id && item.tenantId === tenantId);

  if (!shipment) {
    return null;
  }

  shipment.stage = stage;
  persistShipments();
  return shipment;
}

export function updateShipment(id: string, tenantId: string, input: UpdateShipmentInput) {
  const shipment = shipmentStore.find((item) => item.id === id && item.tenantId === tenantId);

  if (!shipment) {
    return null;
  }

  Object.assign(shipment, input);
  persistShipments();
  return shipment;
}

export function deleteShipment(id: string, tenantId: string) {
  const index = shipmentStore.findIndex((item) => item.id === id && item.tenantId === tenantId);

  if (index === -1) {
    return null;
  }

  const [deleted] = shipmentStore.splice(index, 1);
  const relatedDocuments = documentStore.filter((document) => document.shipmentId !== id);
  documentStore.splice(0, documentStore.length, ...relatedDocuments);
  persistShipments();
  persistDocuments();
  return deleted;
}

export function addShipmentDocument(shipmentId: string, tenantId: string, input: CreateShipmentDocumentInput, uploadedBy: string) {
  const shipment = getShipmentById(shipmentId, tenantId);

  if (!shipment) {
    return null;
  }

  const document: ShipmentDocument = {
    id: `DOC-${Date.now()}`,
    shipmentId,
    type: input.type,
    fileName: input.fileName,
    status: "Ready",
    uploadedBy,
    updatedAt: new Date().toISOString(),
    source: input.source,
    currentVersion: 1,
    visibleToCustomer: false,
    versions: [
      {
        version: 1,
        fileName: input.fileName,
        updatedAt: new Date().toISOString(),
        uploadedBy,
        notes: "Initial issue created in CargoClear."
      }
    ]
  };

  documentStore.unshift(document);
  persistDocuments();
  return document;
}

function findDocument(documentId: string, shipmentId: string) {
  return documentStore.find((document) => document.id === documentId && document.shipmentId === shipmentId) ?? null;
}

export function updateShipmentDocument(
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
  persistDocuments();
  return document;
}

export function addShipmentDocumentVersion(
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

  document.currentVersion = nextVersion;
  document.fileName = input.fileName;
  document.uploadedBy = uploadedBy;
  document.updatedAt = new Date().toISOString();
  document.status = "Ready";
  document.visibleToCustomer = false;
  document.versions.unshift({
    version: nextVersion,
    fileName: input.fileName,
    updatedAt: document.updatedAt,
    uploadedBy,
    notes: input.notes
  });

  persistDocuments();
  return document;
}

export function getCustomerDocumentCount(tenantId: string) {
  const tenantShipmentIds = new Set(shipmentsForTenant(tenantId).map((shipment) => shipment.id));

  return documentStore.filter(
    (document) =>
      tenantShipmentIds.has(document.shipmentId) &&
      document.visibleToCustomer &&
      (document.status === "Approved" || document.status === "Signed")
  ).length;
}

export function getComplianceQueue() {
  return complianceQueue;
}

export function getFinanceSummary() {
  return financeSummary;
}

export function getWarehouseTasks() {
  return warehouseTasks;
}

export function getCustomers(tenantId: string) {
  return customers.filter((customer) => customer.tenantId === tenantId);
}

export function getPlatformOverview() {
  return platformOverview;
}
