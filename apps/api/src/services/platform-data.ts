import {
  complianceQueue,
  type CreateShipmentInput,
  customers,
  dashboardMetrics,
  financeSummary,
  platformOverview,
  shipments,
  type Shipment,
  type ShipmentStage,
  warehouseTasks
} from "../../../../packages/shared/src/index.js";

const shipmentStore: Shipment[] = structuredClone(shipments);

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

export function createShipment(input: CreateShipmentInput) {
  const shipment: Shipment = {
    id: crypto.randomUUID(),
    jobNumber: `CC-${nextShipmentSequence()}`,
    stage: "Booking",
    containerRef: undefined,
    ...input
  };

  shipmentStore.unshift(shipment);
  return shipment;
}

export function updateShipmentStage(id: string, stage: ShipmentStage) {
  const shipment = shipmentStore.find((item) => item.id === id);

  if (!shipment) {
    return null;
  }

  shipment.stage = stage;
  return shipment;
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
