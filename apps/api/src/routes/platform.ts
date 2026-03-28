import { Router } from "express";
import {
  addShipmentDocumentVersion,
  addShipmentDocument,
  convertQuoteToShipment,
  createQuote,
  createShipment,
  deleteShipment,
  getComplianceQueue,
  getCustomers,
  getCustomerDocumentCount,
  getDashboardPayload,
  getFinanceSummaryForScope,
  getInvoiceById,
  getInvoices,
  getPlatformOverview,
  getQuoteById,
  getQuotes,
  getShipmentById,
  getShipmentDetailForRole,
  getShipments,
  getTenantConfig,
  getWarehouseTasks,
  recordInvoicePayment,
  updateShipmentDocument,
  updateQuoteStage,
  updateShipment,
  updateShipmentStage
} from "../services/platform-data.js";
import { renderInvoiceDocument, renderQuoteDocument } from "../services/document-renderer.js";
import type {
  CreateQuoteInput,
  CreateShipmentDocumentVersionInput,
  CreateShipmentDocumentInput,
  CreateShipmentInput,
  InvoiceRecord,
  LoginRequest,
  QuoteRecord,
  QuoteStage,
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
const quoteStages: QuoteStage[] = ["Lead", "Quoted", "Won", "Lost"];

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
    ...getDashboardPayload(
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    ),
    customerDocumentCount: getCustomerDocumentCount(
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    )
  });
});

router.get("/shipments", (request, response) => {
  response.json(
    getShipments(
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    )
  );
});

router.get("/shipments/:id", (request, response) => {
  const shipmentId = getRouteParam(request.params.id);
  const shipment = shipmentId
    ? getShipmentById(
        shipmentId,
        response.locals.session.user.tenantId,
        response.locals.session.user.role,
        response.locals.session.user.customerName
      )
    : null;

  if (!shipment) {
    response.status(404).json({ message: "Shipment not found." });
    return;
  }

  response.json(shipment);
});

router.get("/shipments/:id/detail", (request, response) => {
  const shipmentId = getRouteParam(request.params.id);
  const shipment = shipmentId
    ? getShipmentDetailForRole(
        shipmentId,
        response.locals.session.user.tenantId,
        response.locals.session.user.role,
        response.locals.session.user.customerName
      )
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
  async (request, response) => {
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

    const shipment = await createShipment(payload as CreateShipmentInput, response.locals.session.user.tenantId);
    response.status(201).json(shipment);
  }
);

router.put(
  "/shipments/:id",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  async (request, response) => {
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
      ? await updateShipment(shipmentId, response.locals.session.user.tenantId, payload as UpdateShipmentInput)
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
  async (request, response) => {
    const stage = request.body?.stage as ShipmentStage | undefined;

    if (!stage || !shipmentStages.includes(stage)) {
      response.status(400).json({ message: "Invalid shipment stage." });
      return;
    }

    const shipmentId = getRouteParam(request.params.id);
    const shipment = shipmentId ? await updateShipmentStage(shipmentId, response.locals.session.user.tenantId, stage) : null;

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
  async (request, response) => {
    const payload = request.body as Partial<CreateShipmentDocumentInput>;

    if (!payload.fileName || !payload.source || !shipmentDocumentTypes.includes(payload.type as ShipmentDocumentType)) {
      response.status(400).json({ message: "Invalid shipment document payload." });
      return;
    }

    const document = await addShipmentDocument(
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
  async (request, response) => {
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

    const document = await updateShipmentDocument(shipmentId, response.locals.session.user.tenantId, documentId, payload as UpdateShipmentDocumentInput);

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
  async (request, response) => {
    const payload = request.body as Partial<CreateShipmentDocumentVersionInput>;
    const shipmentId = getRouteParam(request.params.id);
    const documentId = getRouteParam(request.params.documentId);

    if (!shipmentId || !documentId || !payload.fileName) {
      response.status(400).json({ message: "Invalid document version payload." });
      return;
    }

    const document = await addShipmentDocumentVersion(
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
  async (request, response) => {
    const shipmentId = getRouteParam(request.params.id);
    const shipment = shipmentId ? await deleteShipment(shipmentId, response.locals.session.user.tenantId) : null;

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

router.get(
  "/finance/summary",
  requireRoles(["Finance / Billing", "Operations Manager", "System Admin", "Customer"]),
  (_request, response) => {
    response.json(
      getFinanceSummaryForScope(
        response.locals.session.user.tenantId,
        response.locals.session.user.role,
        response.locals.session.user.customerName
      )
    );
  }
);

router.get(
  "/finance/invoices",
  requireRoles(["Finance / Billing", "Operations Manager", "System Admin", "Customer"]),
  (_request, response) => {
    response.json(
      getInvoices(
        response.locals.session.user.tenantId,
        response.locals.session.user.role,
        response.locals.session.user.customerName
      )
    );
  }
);

router.get(
  "/finance/invoices/:id/document",
  requireRoles(["Finance / Billing", "Operations Manager", "System Admin", "Customer"]),
  (request, response) => {
    const invoiceId = getRouteParam(request.params.id);

    if (!invoiceId) {
      response.status(400).json({ message: "Invoice id is required." });
      return;
    }

    const invoice = getInvoiceById(
      invoiceId,
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    );
    const tenant = getTenantConfig(response.locals.session.user.tenantId);

    if (!invoice || !tenant) {
      response.status(404).json({ message: "Invoice not found." });
      return;
    }

    const shipment = getShipmentById(
      invoice.shipmentId,
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    );
    const customer = getCustomers(
      response.locals.session.user.tenantId,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    ).find((item) => item.name === invoice.customerName) ?? null;

    response.type("html").send(
      renderInvoiceDocument({
        tenant,
        invoice,
        shipment,
        customer
      })
    );
  }
);

router.post(
  "/finance/invoices/:id/payments",
  requireRoles(["Finance / Billing", "Operations Manager", "System Admin", "Customer"]),
  async (request, response) => {
    const invoiceId = getRouteParam(request.params.id);
    const amount = Number(request.body?.amount);

    if (!invoiceId || !Number.isFinite(amount) || amount <= 0) {
      response.status(400).json({ message: "Invalid payment payload." });
      return;
    }

    const invoice = await recordInvoicePayment(
      invoiceId,
      response.locals.session.user.tenantId,
      amount,
      response.locals.session.user.role,
      response.locals.session.user.customerName
    );

    if (!invoice) {
      response.status(404).json({ message: "Invoice not found." });
      return;
    }

    response.json(invoice satisfies InvoiceRecord);
  }
);

router.get("/warehouse/tasks", requireRoles(["Warehouse Manager", "Operations Manager", "System Admin"]), (_request, response) => {
  response.json(getWarehouseTasks());
});

router.get(
  "/customers",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin", "Customer"]),
  (_request, response) => {
    response.json(
      getCustomers(
        response.locals.session.user.tenantId,
        response.locals.session.user.role,
        response.locals.session.user.customerName
      )
    );
  }
);

router.get(
  "/crm/quotes",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (_request, response) => {
    response.json(getQuotes(response.locals.session.user.tenantId, response.locals.session.user.role));
  }
);

router.get(
  "/crm/quotes/:id/document",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  (request, response) => {
    const quoteId = getRouteParam(request.params.id);

    if (!quoteId) {
      response.status(400).json({ message: "Quote id is required." });
      return;
    }

    const quote = getQuoteById(quoteId, response.locals.session.user.tenantId, response.locals.session.user.role);
    const tenant = getTenantConfig(response.locals.session.user.tenantId);

    if (!quote || !tenant) {
      response.status(404).json({ message: "Quote not found." });
      return;
    }

    const customer = getCustomers(response.locals.session.user.tenantId, response.locals.session.user.role).find(
      (item) => item.name === quote.customerName
    ) ?? null;

    response.type("html").send(
      renderQuoteDocument({
        tenant,
        quote,
        customer
      })
    );
  }
);

router.post(
  "/crm/quotes",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  async (request, response) => {
    const payload = request.body as Partial<CreateQuoteInput>;
    const hasLineItems = Array.isArray(payload.lineItems) && payload.lineItems.length > 0;

    if (
      !payload.customerName ||
      !payload.contactName ||
      !payload.lane ||
      !payload.mode ||
      !payload.origin ||
      !payload.destination ||
      !payload.incoterm ||
      !payload.owner ||
      !payload.validUntil ||
      typeof payload.estimatedWeightKg !== "number" ||
      typeof payload.expectedMarginPercent !== "number" ||
      !hasLineItems
    ) {
      response.status(400).json({ message: "Invalid quote payload." });
      return;
    }

    const quote = await createQuote(payload as CreateQuoteInput, response.locals.session.user.tenantId);
    response.status(201).json(quote satisfies QuoteRecord);
  }
);

router.patch(
  "/crm/quotes/:id/stage",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  async (request, response) => {
    const quoteId = getRouteParam(request.params.id);
    const stage = request.body?.stage as QuoteStage | undefined;

    if (!quoteId || !stage || !quoteStages.includes(stage)) {
      response.status(400).json({ message: "Invalid quote stage." });
      return;
    }

    const quote = await updateQuoteStage(
      quoteId,
      response.locals.session.user.tenantId,
      stage,
      response.locals.session.user.role
    );

    if (!quote) {
      response.status(404).json({ message: "Quote not found." });
      return;
    }

    response.json(quote satisfies QuoteRecord);
  }
);

router.post(
  "/crm/quotes/:id/convert",
  requireRoles(["Freight Coordinator", "Operations Manager", "System Admin"]),
  async (request, response) => {
    const quoteId = getRouteParam(request.params.id);

    if (!quoteId) {
      response.status(400).json({ message: "Quote id is required." });
      return;
    }

    const shipment = await convertQuoteToShipment(quoteId, response.locals.session.user.tenantId);

    if (!shipment) {
      response.status(404).json({ message: "Quote not found." });
      return;
    }

    response.status(201).json(shipment);
  }
);

router.get("/platform/overview", requireRoles(["System Admin"]), (_request, response) => {
  response.json(getPlatformOverview());
});

export default router;
