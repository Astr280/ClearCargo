import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  complianceQueue,
  type CreateShipmentDocumentInput,
  type CreateShipmentInput,
  customers,
  dashboardMetrics,
  financeSummary,
  platformOverview,
  shipments,
  shipmentDocuments,
  type ShipmentCostLine,
  type ShipmentDetail,
  type ShipmentDocument,
  type Shipment,
  type UpdateShipmentInput,
  type ShipmentStage,
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

function nextShipmentSequence() {
  return shipmentStore.reduce((highest, shipment) => {
    const numericPart = Number(shipment.jobNumber.replace(/\D/g, ""));
    return Number.isNaN(numericPart) ? highest : Math.max(highest, numericPart);
  }, 24022) + 1;
}

export function getDashboardPayload() {
  return {
    metrics: dashboardMetrics,
    recentShipments: shipmentStore.slice(0, 4),
    platform: platformOverview.architecture
  };
}

export function getShipments() {
  return shipmentStore;
}

export function getShipmentById(id: string) {
  return shipmentStore.find((item) => item.id === id) ?? null;
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

export function getShipmentDetail(id: string) {
  const shipment = getShipmentById(id);

  if (!shipment) {
    return null;
  }

  return {
    shipment,
    milestones: buildMilestones(shipment),
    documents: documentStore
      .filter((document) => document.shipmentId === id)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    costLines: buildCostLines(shipment),
    internalNotes: [
      `${shipment.owner} owns operational execution for this job.`,
      `${shipment.customer} requires milestone updates on booking confirmation and customs release.`,
      "Document packet should be complete before customer portal exposure."
    ],
    externalNotes: [
      "Booking confirmed and movement plan shared with consignee.",
      "Customer portal can expose approved documents and current milestone state."
    ],
    flags: buildFlags(shipment)
  } satisfies ShipmentDetail;
}

export function createShipment(input: CreateShipmentInput) {
  const shipment: Shipment = {
    id: crypto.randomUUID(),
    jobNumber: `CC-${nextShipmentSequence()}`,
    stage: "Booking",
    containerRef: undefined,
    ...input
  };

  shipmentStore.unshift(shipment);
  persistShipments();
  return shipment;
}

export function updateShipmentStage(id: string, stage: ShipmentStage) {
  const shipment = shipmentStore.find((item) => item.id === id);

  if (!shipment) {
    return null;
  }

  shipment.stage = stage;
  persistShipments();
  return shipment;
}

export function updateShipment(id: string, input: UpdateShipmentInput) {
  const shipment = shipmentStore.find((item) => item.id === id);

  if (!shipment) {
    return null;
  }

  Object.assign(shipment, input);
  persistShipments();
  return shipment;
}

export function deleteShipment(id: string) {
  const index = shipmentStore.findIndex((item) => item.id === id);

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

export function addShipmentDocument(shipmentId: string, input: CreateShipmentDocumentInput) {
  const shipment = getShipmentById(shipmentId);

  if (!shipment) {
    return null;
  }

  const document: ShipmentDocument = {
    id: `DOC-${Date.now()}`,
    shipmentId,
    type: input.type,
    fileName: input.fileName,
    status: "Ready",
    uploadedBy: input.uploadedBy,
    updatedAt: new Date().toISOString(),
    source: input.source
  };

  documentStore.unshift(document);
  persistDocuments();
  return document;
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

export function getCustomers() {
  return customers;
}

export function getPlatformOverview() {
  return platformOverview;
}
