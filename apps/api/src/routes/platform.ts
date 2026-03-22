import { Router } from "express";
import {
  getComplianceQueue,
  getCustomers,
  getDashboardPayload,
  getFinanceSummary,
  getPlatformOverview,
  getShipments,
  getWarehouseTasks
} from "../services/platform-data.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "cargoclear-api" });
});

router.get("/dashboard", (_request, response) => {
  response.json(getDashboardPayload());
});

router.get("/shipments", (_request, response) => {
  response.json(getShipments());
});

router.get("/compliance/queue", (_request, response) => {
  response.json(getComplianceQueue());
});

router.get("/finance/summary", (_request, response) => {
  response.json(getFinanceSummary());
});

router.get("/warehouse/tasks", (_request, response) => {
  response.json(getWarehouseTasks());
});

router.get("/customers", (_request, response) => {
  response.json(getCustomers());
});

router.get("/platform/overview", (_request, response) => {
  response.json(getPlatformOverview());
});

export default router;
