import { Router } from "express";
import {
  addShipmentDocumentVersion,
  addShipmentDocument,
  createShipment,
  deleteShipment,
  getComplianceQueue,
  getCustomers,
  getCustomerDocumentCount,
  getDashboardPayload,
  getFinanceSummary,
  getPlatformOverview,
  getShipmentById,
  getShipmentDetailForRole,
  getShipments,
  getWarehouseTasks,
  updateShipmentDocument,
  updateShipment,
  updateShipmentStage
} from "../services/platform-data.js";
import type {
  CreateShipmentDocumentVersionInput,
  CreateShipmentDocumentInput,
  CreateShipmentInput,
  LoginRequest,
  ShipmentDocumentType,
  ShipmentDocumentStatus,
  ShipmentStage,
  UpdateShipmentDocumentInput,
  UpdateShipmentInput
} from "../../../../packages/shared/src/index.js";
import { requireRoles, requireSession } from "../middleware/auth.js";
import { getDemoAccounts, getSession, login, logout } from "../services/auth.js";

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
const shipmentDocumentStatuses: ShipmentDocumentStatus[] = ["Draft", "Ready", "Approved", "Signed"];

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "cargoclear-api" });
});

router.get("/auth/demo-users", (_request, response) => {
  response.json({
    users: getDemoAccounts(),
    password: "CargoClear!2026",
    mfaCode: "123456"
  });
});

router.post("/auth/login", (request, response) => {
  const payload = request.body as Partial<LoginRequest>;

  if (!payload.email || !payload.password) {
    response.status(400).json({ message: "Email and password are required." });
    return;
  }

  const result = login({
    email: payload.email,
    password: payload.password,
    mfaCode: payload.mfaCode
  });

  if (result.status === "invalid") {
    response.status(401).json({ message: result.message });
    return;
  }

  if (result.status === "mfa-required") {
    response.json({
      mfaRequired: true,
      challenge: result.challenge,
      message: "MFA verification required."
    });
    return;
  }

  response.json({ session: result.session });
});

router.get("/auth/session", requireSession, (request, response) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
  const session = getSession(token);
  response.json({ session });
});

router.post("/auth/logout", requireSession, (request, response) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
  logout(token);
  response.json({ success: true });
});

router.use(requireSession);

router.get("/dashboard", (request, response) => {
  response.json({
    ...getDashboardPayload(response.locals.session.user.tenantId),
    customerDocumentCount: getCustomerDocumentCount(response.locals.session.user.tenantId)
  });
});

router.get("/shipments", (request, response) => {
  response.json(getShipments(response.locals.session.user.tenantId));
});

router.get("/shipments/:id", (request, response) => {
  const shipmentId = getRouteParam(request.params.id);
  const shipment = shipmentId ? getShipmentById(shipmentId, response.locals.session.user.tenantId) : null;

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
});

router.get("/shipments/:id/detail", (request, response) => {
  const shipmentId = getRouteParam(request.params.id);
  const shipment = shipmentId
    ? getShipmentDetailForRole(shipmentId, response.locals.session.user.tenantId, response.locals.session.user.role)
    : null;

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
});

router.post(
  "/shipments",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (request, response) => {
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

    const shipment = createShipment(payload as CreateShipmentInput, response.locals.session.user.tenantId);
    response.status(201).json(shipment);
  }
);

router.put(
  "/shipments/:id",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (request, response) => {
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

    const shipmentId = getRouteParam(request.params.id);
    const shipment = shipmentId
      ? updateShipment(shipmentId, response.locals.session.user.tenantId, payload as UpdateShipmentInput)
      : null;

    if (!shipment) {
      response.status(404).json({ message: "Shipment not found." });
      return;
    }

    response.json(shipment);
  }
);

router.patch(
  "/shipments/:id/stage",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (request, response) => {
    const stage = request.body?.stage as ShipmentStage | undefined;

    if (!stage || !shipmentStages.includes(stage)) {
      response.status(400).json({ message: "Invalid shipment stage." });
      return;
    }

    const shipmentId = getRouteParam(request.params.id);
    const shipment = shipmentId ? updateShipmentStage(shipmentId, response.locals.session.user.tenantId, stage) : null;

    if (!shipment) {
      response.status(404).json({ message: "Shipment not found." });
      return;
    }

    response.json(shipment);
  }
);

router.post(
  "/shipments/:id/documents",
  requireRoles(["Freight Coordinator", "Customs Broker", "Operations Manager", "System Admin"]),
  (request, response) => {
    const payload = request.body as Partial<CreateShipmentDocumentInput>;

    if (!payload.fileName || !payload.source || !shipmentDocumentTypes.includes(payload.type as ShipmentDocumentType)) {
      response.status(400).json({ message: "Invalid shipment document payload." });
      return;
    }

    const document = addShipmentDocument(
      getRouteParam(request.params.id) ?? "",
      response.locals.session.user.tenantId,
      payload as CreateShipmentDocumentInput,
      response.locals.session.user.name
    );

    if (!document) {
      response.status(404).json({ message: "Shipment not found." });
      return;
    }

    response.status(201).json(document);
  }
);

router.patch(
  "/shipments/:id/documents/:documentId",
  requireRoles(["Freight Coordinator", "Customs Broker", "Operations Manager", "System Admin"]),
  (request, response) => {
    const payload = request.body as Partial<UpdateShipmentDocumentInput>;
    const shipmentId = getRouteParam(request.params.id);
    const documentId = getRouteParam(request.params.documentId);

    if (
      !shipmentId ||
      !documentId ||
      (payload.status && !shipmentDocumentStatuses.includes(payload.status as ShipmentDocumentStatus)) ||
      (typeof payload.visibleToCustomer !== "boolean" && !payload.status)
    ) {
      response.status(400).json({ message: "Invalid shipment document update payload." });
      return;
    }

    const document = updateShipmentDocument(shipmentId, response.locals.session.user.tenantId, documentId, payload as UpdateShipmentDocumentInput);

    if (!document) {
      response.status(404).json({ message: "Document not found." });
      return;
    }

    response.json(document);
  }
);

router.post(
  "/shipments/:id/documents/:documentId/versions",
  requireRoles(["Freight Coordinator", "Customs Broker", "Operations Manager", "System Admin"]),
  (request, response) => {
    const payload = request.body as Partial<CreateShipmentDocumentVersionInput>;
    const shipmentId = getRouteParam(request.params.id);
    const documentId = getRouteParam(request.params.documentId);

    if (!shipmentId || !documentId || !payload.fileName) {
      response.status(400).json({ message: "Invalid document version payload." });
      return;
    }

    const document = addShipmentDocumentVersion(
      shipmentId,
      response.locals.session.user.tenantId,
      documentId,
      payload as CreateShipmentDocumentVersionInput,
      response.locals.session.user.name
    );

    if (!document) {
      response.status(404).json({ message: "Document not found." });
      return;
    }

    response.status(201).json(document);
  }
);

router.delete(
  "/shipments/:id",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (request, response) => {
    const shipmentId = getRouteParam(request.params.id);
    const shipment = shipmentId ? deleteShipment(shipmentId, response.locals.session.user.tenantId) : null;

    if (!shipment) {
      response.status(404).json({ message: "Shipment not found." });
      return;
    }

    response.json(shipment);
  }
);

router.get("/compliance/queue", requireRoles(["Customs Broker", "Operations Manager", "System Admin"]), (_request, response) => {
  response.json(getComplianceQueue());
});

router.get("/finance/summary", requireRoles(["Finance / Billing", "Operations Manager", "System Admin"]), (_request, response) => {
  response.json(getFinanceSummary());
});

router.get("/warehouse/tasks", requireRoles(["Warehouse Manager", "Operations Manager", "System Admin"]), (_request, response) => {
  response.json(getWarehouseTasks());
});

router.get("/customers", requireRoles(["Freight Coordinator", "Operations Manager", "System Admin", "Customer"]), (_request, response) => {
  response.json(getCustomers(response.locals.session.user.tenantId));
});

router.get("/platform/overview", requireRoles(["System Admin"]), (_request, response) => {
  response.json(getPlatformOverview());
});

export default router;
