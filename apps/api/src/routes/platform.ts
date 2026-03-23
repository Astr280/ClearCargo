import { Router } from "express";
import {
  addShipmentDocument,
  createShipment,
  deleteShipment,
  getComplianceQueue,
  getCustomers,
  getDashboardPayload,
  getFinanceSummary,
  getPlatformOverview,
  getShipmentById,
  getShipmentDetail,
  getShipments,
  getWarehouseTasks,
  updateShipment,
  updateShipmentStage
} from "../services/platform-data.js";
import type {
  CreateShipmentDocumentInput,
  CreateShipmentInput,
  ShipmentDocumentType,
  ShipmentStage,
  UpdateShipmentInput
} from "../../../../packages/shared/src/index.js";

const router = Router();
const shipmentStages: ShipmentStage[] = ["Booking", "Confirmed", "In Transit", "Customs", "Delivered", "Closed"];
const shipmentDocumentTypes: ShipmentDocumentType[] = [
  "Commercial Invoice",
  "Packing List",
  "Air Waybill",
  "House Bill",
  "Customs Entry",
  "Delivery Order"
];

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "cargoclear-api" });
});

router.get("/dashboard", (_request, response) => {
  response.json(getDashboardPayload());
});

router.get("/shipments", (_request, response) => {
  response.json(getShipments());
});

router.get("/shipments/:id", (request, response) => {
  const shipment = getShipmentById(request.params.id);

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
});

router.get("/shipments/:id/detail", (request, response) => {
  const shipment = getShipmentDetail(request.params.id);

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
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

router.put("/shipments/:id", (request, response) => {
  const payload = request.body as Partial<UpdateShipmentInput>;

  if (
    !payload.customer ||
    !payload.mode ||
    !payload.origin ||
    !payload.destination ||
    !payload.incoterm ||
    !payload.owner ||
    !payload.stage ||
    typeof payload.weightKg !== "number" ||
    typeof payload.marginPercent !== "number"
  ) {
    response.status(400).json({ message: "Invalid shipment payload." });
    return;
  }

  const shipment = updateShipment(request.params.id, payload as UpdateShipmentInput);

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
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

router.post("/shipments/:id/documents", (request, response) => {
  const payload = request.body as Partial<CreateShipmentDocumentInput>;

  if (
    !payload.fileName ||
    !payload.uploadedBy ||
    !payload.source ||
    !shipmentDocumentTypes.includes(payload.type as ShipmentDocumentType)
  ) {
    response.status(400).json({ message: "Invalid shipment document payload." });
    return;
  }

  const document = addShipmentDocument(request.params.id, payload as CreateShipmentDocumentInput);

  if (!document) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.status(201).json(document);
});

router.delete("/shipments/:id", (request, response) => {
  const shipment = deleteShipment(request.params.id);

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
