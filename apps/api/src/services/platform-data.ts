import fs from "node:fs";
import path from "node:path";
import {
  complianceQueue,
  type CreateShipmentInput,
  customers,
  dashboardMetrics,
  financeSummary,
  platformOverview,
  shipments,
  type Shipment,
  type UpdateShipmentInput,
  type ShipmentStage,
  warehouseTasks
} from "../../../../packages/shared/src/index.js";

const shipmentDataPath = path.join(process.cwd(), "data", "shipments.json");
const seededShipments: Shipment[] = structuredClone(shipments);

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

const shipmentStore: Shipment[] = loadShipmentStore();

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
  persistShipments();
  return deleted;
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
