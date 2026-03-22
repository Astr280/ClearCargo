import {
  complianceQueue,
  customers,
  dashboardMetrics,
  financeSummary,
  platformOverview,
  shipments,
  warehouseTasks
} from "../../../../packages/shared/src/index.js";

export function getDashboardPayload() {
  return {
    metrics: dashboardMetrics,
    recentShipments: shipments.slice(0, 4),
    platform: platformOverview.architecture
  };
}

export function getShipments() {
  return shipments;
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
