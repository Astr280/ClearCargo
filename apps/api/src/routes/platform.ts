import { Router } from "express";
import {
  createShipment,
  getComplianceQueue,
  getCustomers,
  getDashboardPayload,
  getFinanceSummary,
  getPlatformOverview,
  getShipments,
  getWarehouseTasks,
  updateShipmentStage
} from "../services/platform-data.js";
import type { CreateShipmentInput, ShipmentStage } from "../../../../packages/shared/src/index.js";

const router = Router();
const shipmentStages: ShipmentStage[] = ["Booking", "Confirmed", "In Transit", "Customs", "Delivered", "Closed"];

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "cargoclear-api" });
});

router.get("/dashboard", (_request, response) => {
  response.json(getDashboardPayload());
});

router.get("/shipments", (_request, response) => {
  response.json(getShipments());
});

router.post("/shipments", (request, response) => {
  const payload = request.body as Partial<CreateShipmentInput>;

  if (
    !payload.customer ||
    !payload.mode ||
    !payload.origin ||
    !payload.destination ||
    !payload.incoterm ||
    !payload.owner ||
    typeof payload.weightKg !== "number" ||
    typeof payload.marginPercent !== "number"
  ) {
    response.status(400).json({ message: "Invalid shipment payload." });
    return;
  }

  const shipment = createShipment(payload as CreateShipmentInput);
  response.status(201).json(shipment);
});

router.patch("/shipments/:id/stage", (request, response) => {
  const stage = request.body?.stage as ShipmentStage | undefined;

  if (!stage || !shipmentStages.includes(stage)) {
    response.status(400).json({ message: "Invalid shipment stage." });
    return;
  }

  const shipment = updateShipmentStage(request.params.id, stage);

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
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
