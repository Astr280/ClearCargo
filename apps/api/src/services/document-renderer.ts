import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CustomerAccount, InvoiceRecord, QuoteRecord, Shipment, TenantConfig } from "../../../../packages/shared/src/index.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logoCandidates = [
  path.resolve(process.cwd(), "assets/cargoclear-logo.svg"),
  path.resolve(currentDir, "../../../../assets/cargoclear-logo.svg"),
  path.resolve(currentDir, "../../../../../../assets/cargoclear-logo.svg")
];
const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
const inlineLogo = logoPath ? fs.readFileSync(logoPath, "utf-8") : "<strong>CargoClear</strong>";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

function escapeHtml(value: string | number | undefined) {
  if (value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderShell(title: string, tenant: TenantConfig, body: string) {
  const companyName = escapeHtml(tenant.branding.companyName);
  const primaryColor = tenant.branding.primaryColor;
  const secondaryColor = tenant.branding.secondaryColor;
  const accentColor = tenant.branding.accentColor;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --primary: ${primaryColor};
        --secondary: ${secondaryColor};
        --accent: ${accentColor};
        --line: #d9e2f1;
        --text: #15233b;
        --muted: #5b6a84;
        --paper: #ffffff;
        --panel: #f7faff;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        color: var(--text);
        background: #eef3fb;
      }
      .page {
        width: 960px;
        margin: 24px auto;
        background: var(--paper);
        border: 1px solid var(--line);
        box-shadow: 0 18px 40px rgba(15, 29, 58, 0.08);
      }
      .hero {
        padding: 28px 36px 22px;
        border-bottom: 1px solid var(--line);
        background: linear-gradient(135deg, rgba(15, 79, 191, 0.06), rgba(22, 164, 201, 0.05));
      }
      .hero-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .logo {
        width: 180px;
      }
      .logo svg {
        width: 100%;
        height: auto;
        display: block;
      }
      .eyebrow {
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--primary);
        font-weight: 700;
        margin-bottom: 6px;
      }
      h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.15;
      }
      .subtitle {
        margin-top: 8px;
        color: var(--muted);
        font-size: 14px;
      }
      .badge {
        border: 1px solid rgba(15, 79, 191, 0.16);
        color: var(--primary);
        background: rgba(255, 255, 255, 0.82);
        padding: 10px 14px;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .content {
        padding: 28px 36px 36px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 22px;
      }
      .panel {
        border: 1px solid var(--line);
        background: var(--panel);
        padding: 16px 18px;
      }
      .panel h2 {
        margin: 0 0 12px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
      }
      .kpi {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 8px 14px;
        font-size: 14px;
        line-height: 1.5;
      }
      .label {
        color: var(--muted);
        font-weight: 600;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th,
      td {
        padding: 11px 10px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        font-size: 14px;
        vertical-align: top;
      }
      th {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }
      .align-right {
        text-align: right;
      }
      .totals {
        margin-top: 22px;
        width: 340px;
        margin-left: auto;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--line);
        font-size: 14px;
      }
      .totals-row.total {
        font-size: 18px;
        font-weight: 700;
        color: var(--accent);
      }
      .notes {
        margin-top: 22px;
        padding: 16px 18px;
        border: 1px solid var(--line);
        background: #fbfdff;
      }
      .notes h3 {
        margin: 0 0 10px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent);
      }
      .notes p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
        font-size: 14px;
      }
      .footer {
        margin-top: 28px;
        color: var(--muted);
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        gap: 18px;
        border-top: 1px solid var(--line);
        padding-top: 14px;
      }
      @media print {
        body {
          background: #fff;
        }
        .page {
          width: auto;
          margin: 0;
          border: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="hero">
        <div class="hero-top">
          <div class="brand">
            <div class="logo">${inlineLogo}</div>
            <div>
              <div class="eyebrow">${companyName}</div>
              <h1>${escapeHtml(title)}</h1>
              <div class="subtitle">Generated from the CargoClear operations platform</div>
            </div>
          </div>
          <div class="badge">Print-ready</div>
        </div>
      </div>
      <div class="content">
        ${body}
        <div class="footer">
          <span>${companyName} logistics workflow document</span>
          <span>Prepared in CargoClear</span>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function renderInvoiceDocument({
  tenant,
  invoice,
  shipment,
  customer
}: {
  tenant: TenantConfig;
  invoice: InvoiceRecord;
  shipment: Shipment | null;
  customer: CustomerAccount | null;
}) {
  const outstanding = invoice.totalAmount - invoice.paidAmount;
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const laneDescription = customer?.lane ?? (shipment ? `${shipment.origin} to ${shipment.destination}` : "Operational shipment lane");
  const notes = shipment
    ? `This invoice is linked to shipment ${shipment.jobNumber} moving ${shipment.mode.toUpperCase()} cargo from ${shipment.origin} to ${shipment.destination} under ${shipment.incoterm} terms.`
    : "This invoice was generated from the CargoClear finance workspace.";

  const body = `
    <div class="grid">
      <section class="panel">
        <h2>Billing Party</h2>
        <div class="kpi">
          <div class="label">Customer</div><div>${escapeHtml(invoice.customerName)}</div>
          <div class="label">Contact</div><div>${escapeHtml(customer?.contacts[0]?.name ?? "Primary account contact")}</div>
          <div class="label">Lane</div><div>${escapeHtml(laneDescription)}</div>
          <div class="label">Terms</div><div>${escapeHtml(customer?.creditTerms ?? "Per agreement")}</div>
        </div>
      </section>
      <section class="panel">
        <h2>Invoice Summary</h2>
        <div class="kpi">
          <div class="label">Invoice</div><div>${escapeHtml(invoice.invoiceNumber)}</div>
          <div class="label">Issued</div><div>${formatDate(invoice.issuedAt)}</div>
          <div class="label">Due</div><div>${formatDate(invoice.dueDate)}</div>
          <div class="label">Status</div><div>${escapeHtml(invoice.status)}</div>
          <div class="label">Shipment</div><div>${escapeHtml(shipment?.jobNumber ?? invoice.shipmentId)}</div>
        </div>
      </section>
    </div>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th class="align-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.lineItems
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.code)}</td>
                <td>${escapeHtml(item.description)}</td>
                <td class="align-right">${formatCurrency(item.amount, invoice.currency)}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal, invoice.currency)}</span></div>
      <div class="totals-row"><span>Payments applied</span><span>${formatCurrency(invoice.paidAmount, invoice.currency)}</span></div>
      <div class="totals-row total"><span>Outstanding</span><span>${formatCurrency(outstanding, invoice.currency)}</span></div>
    </div>
    <div class="notes">
      <h3>Operational Note</h3>
      <p>${escapeHtml(notes)}</p>
    </div>
  `;

  return renderShell(`Invoice ${invoice.invoiceNumber}`, tenant, body);
}

export function renderQuoteDocument({
  tenant,
  quote,
  customer
}: {
  tenant: TenantConfig;
  quote: QuoteRecord;
  customer: CustomerAccount | null;
}) {
  const total = quote.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const body = `
    <div class="grid">
      <section class="panel">
        <h2>Customer</h2>
        <div class="kpi">
          <div class="label">Account</div><div>${escapeHtml(quote.customerName)}</div>
          <div class="label">Contact</div><div>${escapeHtml(quote.contactName)}</div>
          <div class="label">Trade lane</div><div>${escapeHtml(quote.lane)}</div>
          <div class="label">Preferred carriers</div><div>${escapeHtml(customer?.preferredCarriers.join(", ") ?? "Configured by account")}</div>
        </div>
      </section>
      <section class="panel">
        <h2>Quote Summary</h2>
        <div class="kpi">
          <div class="label">Quote</div><div>${escapeHtml(quote.quoteNumber)}</div>
          <div class="label">Created</div><div>${formatDate(quote.createdAt)}</div>
          <div class="label">Valid until</div><div>${formatDate(quote.validUntil)}</div>
          <div class="label">Status</div><div>${escapeHtml(quote.status)}</div>
          <div class="label">Stage</div><div>${escapeHtml(quote.stage)}</div>
          <div class="label">Owner</div><div>${escapeHtml(quote.owner)}</div>
        </div>
      </section>
    </div>
    <div class="grid">
      <section class="panel">
        <h2>Routing</h2>
        <div class="kpi">
          <div class="label">Mode</div><div>${escapeHtml(quote.mode)}</div>
          <div class="label">Origin</div><div>${escapeHtml(quote.origin)}</div>
          <div class="label">Destination</div><div>${escapeHtml(quote.destination)}</div>
          <div class="label">Incoterm</div><div>${escapeHtml(quote.incoterm)}</div>
          <div class="label">Estimated weight</div><div>${escapeHtml(quote.estimatedWeightKg.toLocaleString())} kg</div>
          <div class="label">Target margin</div><div>${escapeHtml(quote.expectedMarginPercent.toFixed(1))}%</div>
        </div>
      </section>
      <section class="panel">
        <h2>Commercial Notes</h2>
        <div class="kpi">
          <div class="label">Quote value</div><div>${formatCurrency(total, "USD")}</div>
          <div class="label">Scope</div><div>${escapeHtml(quote.notes ?? "Freight, local handling, and document services as listed below.")}</div>
        </div>
      </section>
    </div>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th class="align-right">Quoted Amount</th>
        </tr>
      </thead>
      <tbody>
        ${quote.lineItems
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.code)}</td>
                <td>${escapeHtml(item.description)}</td>
                <td class="align-right">${formatCurrency(item.amount, "USD")}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-row total"><span>Total quoted charges</span><span>${formatCurrency(total, "USD")}</span></div>
    </div>
    <div class="notes">
      <h3>Commercial Statement</h3>
      <p>This quote is valid through ${escapeHtml(formatDate(quote.validUntil))} and can be converted directly into an operational shipment inside CargoClear once approved.</p>
    </div>
  `;

  return renderShell(`Quote ${quote.quoteNumber}`, tenant, body);
}
