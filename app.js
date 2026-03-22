const data = {
  heroStats: [
    { label: "Open jobs", value: "1,248" },
    { label: "Docs automated", value: "96%" },
    { label: "Collections due", value: "$182K" },
    { label: "Customs SLA", value: "0.4% error" }
  ],
  pulse: [
    { label: "Jobs this month", value: "4,960", note: "Across ocean, air, and road lanes" },
    { label: "Avg. job creation", value: "2m 18s", note: "Under the 3-minute launch target" },
    { label: "Document pack time", value: "24s", note: "AWB, BL, invoice, and release docs" },
    { label: "Search latency", value: "432ms", note: "HS codes, jobs, and customer files" }
  ],
  roles: [
    { title: "Freight Coordinator", detail: "Creates jobs, books carriers, manages docs and milestones." },
    { title: "Customs Broker", detail: "Runs declarations, tariff lookup, duty workflows, and filings." },
    { title: "Finance Team", detail: "Owns AR, AP, reconciliation, GP analysis, and statements." },
    { title: "Warehouse Manager", detail: "Controls inbound, put-away, inventory, outbound, and exceptions." },
    { title: "Operations Manager", detail: "Monitors KPIs, team performance, and service reliability." },
    { title: "Customer", detail: "Tracks shipments, downloads docs, pays invoices, and submits requests." }
  ],
  launch: [
    {
      title: "Shipment Control Tower",
      detail: "Multi-modal job creation, status milestones, split shipments, cloned jobs, and configurable numbering."
    },
    {
      title: "Branded Document Engine",
      detail: "Commercial invoice, packing list, AWB, bill of lading, customs summary, and release docs with logo support."
    },
    {
      title: "Finance Starter Stack",
      detail: "AR invoicing, payment capture, GP per job visibility, exchange rates, and aging analysis."
    },
    {
      title: "Customer Visibility Portal",
      detail: "Tracking, approved document download, invoice status, booking requests, and secure role-based access."
    }
  ],
  artifacts: [
    { title: "README", detail: "Project summary, run instructions, module map, and repo layout." },
    { title: "Architecture Notes", detail: "Recommended stack, services, tenancy, and deployment boundaries." },
    { title: "Implementation Plan", detail: "Phase-by-phase backlog aligned to the original delivery plan." },
    { title: "Schema Starter", detail: "Sample PostgreSQL schema covering tenants, shipments, finance, and docs." }
  ],
  modules: [
    { title: "Shipment Management", text: "FCL, LCL, air, road, rail, and multimodal jobs with milestone timestamps and repeat-shipment cloning." },
    { title: "Customs & Compliance", text: "HS lookup, duties, entry types, AES and ISF pathways, sanctions screening, and audit trails." },
    { title: "Transport & Carrier", text: "Rate cards, booking confirmations, AWB and BL flows, detention tracking, and schedule lookups." },
    { title: "Document Management", text: "Template branding, versioning, OCR intake, e-signature routing, and bulk ZIP delivery." },
    { title: "Finance & Billing", text: "AR, AP, multi-currency, GP variance alerts, statements, reconciliation, and online payment rails." },
    { title: "Warehouse WMS", text: "Inbound, put-away, bin inventory, outbound picking, cold-chain zones, and barcode operations." },
    { title: "Customer Portal", text: "White-labelled tracking, document access, quote requests, messaging, and preferences." },
    { title: "CRM & Quotation", text: "Quote builder, lead pipeline, trade-lane preferences, and one-click quote-to-job conversion." },
    { title: "Analytics", text: "KPI widgets, carrier performance, lane heatmaps, duty summaries, and scheduled exports." },
    { title: "Multi-Tenancy", text: "Tenant-level branding, feature flags, isolated data, and usage billing." },
    { title: "Mobile Apps", text: "Driver proof of delivery and warehouse scanning with offline resilience." }
  ],
  shipmentBoard: [
    {
      stage: "Booking",
      items: [
        { id: "CC-24018", route: "Shenzhen -> Long Beach", owner: "A. Mehta", tags: ["FCL", "Reefer", "Docs pending"] },
        { id: "CC-24022", route: "Frankfurt -> Chicago", owner: "J. Patel", tags: ["Air", "DG", "Priority"] }
      ]
    },
    {
      stage: "Confirmed",
      items: [
        { id: "CC-23984", route: "Nhava Sheva -> Felixstowe", owner: "S. Khan", tags: ["LCL", "ISF ready"] },
        { id: "CC-23990", route: "Rotterdam -> Dallas", owner: "R. Singh", tags: ["Road", "Customs hold"] }
      ]
    },
    {
      stage: "In Transit",
      items: [
        { id: "CC-23967", route: "Singapore -> Los Angeles", owner: "N. Thomas", tags: ["FCL", "ETA 23 Mar"] },
        { id: "CC-23971", route: "Dubai -> Mumbai", owner: "P. Roy", tags: ["Air", "Express"] }
      ]
    },
    {
      stage: "Customs",
      items: [
        { id: "CC-23951", route: "Busan -> Houston", owner: "D. Shah", tags: ["7501 ready", "Bond active"] }
      ]
    },
    {
      stage: "Delivered",
      items: [
        { id: "CC-23922", route: "Antwerp -> Newark", owner: "L. Cruz", tags: ["Closed", "Invoice sent"] }
      ]
    }
  ],
  documents: [
    { name: "Commercial Invoice", status: "Ready", meta: "Branded PDF | e-sign routing" },
    { name: "Packing List", status: "Ready", meta: "Version 3 | OCR matched" },
    { name: "Air Waybill", status: "Pending", meta: "IATA format | carrier draft" },
    { name: "House Bill of Lading", status: "Ready", meta: "Customer-visible | watermarked" },
    { name: "CBP 7501 Summary", status: "Queued", meta: "Awaiting entry confirmation" }
  ],
  carriers: [
    { name: "Maersk", detail: "SCAC: MAEU | 16 active ocean bookings" },
    { name: "Lufthansa Cargo", detail: "IATA e-AWB enabled | 9 air jobs" },
    { name: "DHL Global Forwarding", detail: "Spot rate sync | 4 urgent quotes" },
    { name: "Local Drayage West", detail: "Truck dispatch | 3 last-mile assignments" }
  ],
  operationsChecklist: [
    "Auto-generated job numbers",
    "Split shipment support",
    "Bulk CSV and Excel import",
    "Dangerous goods checks",
    "Reefer cargo flagging",
    "Unlimited job documents",
    "Customer-visible notes",
    "Clone job for repeat traffic"
  ],
  compliance: [
    {
      title: "Entry filing stack",
      items: ["Formal and informal entries", "In-bond, FTZ, drawback support", "Post-entry amendment tracking"]
    },
    {
      title: "Trade controls",
      items: ["HS tariff autocomplete", "Duty and tax engine by country", "EAR and ECCN license checks"]
    },
    {
      title: "US workflows",
      items: ["AES and EEI filing path", "ISF 10+2 support", "CBP 7501 generation and audit logs"]
    }
  ],
  screening: [
    { title: "OFAC SDN", detail: "Auto-screen on every party creation and shipment update." },
    { title: "EU Sanctions", detail: "Consolidated list checks logged per shipment for audit readiness." },
    { title: "UN Sanctions", detail: "Automated match review with user attribution and timestamping." },
    { title: "BIS Denied Parties", detail: "Escalates dual-use and export-license exceptions to compliance." }
  ],
  security: [
    { title: "SOC 2 posture", detail: "Designed for Type II controls from the first deployment." },
    { title: "Encryption", detail: "AES-256 at rest, TLS 1.3 in transit, full audit logging on data changes." },
    { title: "Tenant controls", detail: "RBAC, IP allowlisting, MFA, and isolated tenant configuration." },
    { title: "Recovery", detail: "Daily full backups, point-in-time restore, and under-4-hour RTO target." }
  ],
  revenue: [
    { month: "Jan", value: 48 },
    { month: "Feb", value: 61 },
    { month: "Mar", value: 72 },
    { month: "Apr", value: 69 },
    { month: "May", value: 84 },
    { month: "Jun", value: 96 }
  ],
  financeHighlights: [
    { label: "Gross profit", value: "$412K", note: "15.7% above target" },
    { label: "Outstanding AP", value: "$131K", note: "12 carrier invoices pending" },
    { label: "FX variance", value: "1.8%", note: "Auto-refreshed from live rate feed" }
  ],
  aging: [
    { bucket: "0-30 days", amount: "$94K", detail: "Healthy receivables across 42 customers." },
    { bucket: "31-60 days", amount: "$51K", detail: "2 enterprise accounts awaiting PO release." },
    { bucket: "61-90 days", amount: "$23K", detail: "Escalation sequence active for 6 invoices." },
    { bucket: "90+ days", amount: "$14K", detail: "Collections manager follow-up scheduled." }
  ],
  margins: [
    { title: "CC-23990", detail: "Margin down to 8.1% after drayage surcharge and demurrage." },
    { title: "CC-23951", detail: "Customs rework created unbilled compliance time exposure." },
    { title: "CC-24022", detail: "DG handling cost raised airway margin pressure." }
  ],
  warehouseFlow: [
    { title: "Receive", detail: "Inbound cargo check against packing list with exception capture." },
    { title: "Put-away", detail: "Assign zone, aisle, bay, and bin with scan confirmation." },
    { title: "Store", detail: "Track stock by location, temperature zone, and aging profile." },
    { title: "Pick & Pack", detail: "Execute pick list, verify labels, and prep outbound movement." },
    { title: "Dispatch", detail: "Link dispatch to shipment jobs and last-mile assignments." }
  ],
  warehouseMetrics: [
    { label: "Inbound receipts", value: "186", note: "15 exceptions captured today" },
    { label: "Bin accuracy", value: "99.1%", note: "Cycle count variance below threshold" },
    { label: "Cold-chain slots", value: "74%", note: "Temperature zone capacity in use" },
    { label: "Outbound picks", value: "312", note: "91% completed before SLA cut-off" }
  ],
  mobileApps: [
    { title: "Driver app", detail: "Assignments, GPS sharing, POD photo and signature, offline sync, exception reporting." },
    { title: "Warehouse app", detail: "Scan inbound cargo, put-away to bins, execute pick lists, count stock, print labels." }
  ],
  stock: [
    { title: "Cross-docking", detail: "Priority inventory bypasses storage and moves straight to outbound staging." },
    { title: "Cold-chain", detail: "Temperature zone management with linked reefer and pharma handling." },
    { title: "Cycle counts", detail: "Tablet-optimized counts maintain real-time stock confidence." }
  ],
  crmStages: [
    { title: "Leads", detail: "8 active prospects across APAC-US lanes." },
    { title: "Quoted", detail: "14 quotes open with validity and auto-expiry controls." },
    { title: "Won", detail: "6 converted to jobs this week." },
    { title: "Lost", detail: "3 deferred on pricing pressure and transit-time mismatch." }
  ],
  portalCards: [
    { title: "Tracked shipments", value: "24", note: "2 in customs, 2 delivered today" },
    { title: "Approved documents", value: "118", note: "Downloadable by shipment and date" },
    { title: "Open invoices", value: "$76K", note: "Pay online via Stripe or ACH" }
  ],
  portalFeatures: [
    { title: "Track every milestone", detail: "From booking confirmation through delivery and closure." },
    { title: "Access branded documents", detail: "Only approved files are customer-visible, with download history." },
    { title: "Submit booking and quote requests", detail: "Portal requests feed directly into the internal workflow queue." },
    { title: "Message your coordinator", detail: "Conversation threads stay tied to the shipment record." }
  ],
  quotes: [
    { title: "Lane pricing", detail: "Store trade-lane rules, preferred carriers, and credit terms per customer." },
    { title: "Quote builder", detail: "Itemize freight, customs, handling, THC, DOC, and margin assumptions." },
    { title: "One-click convert", detail: "Accepted quote instantly becomes an operational shipment job." }
  ],
  kpis: [
    { title: "Jobs this month", detail: "4,960 total shipments across all modes." },
    { title: "Revenue", detail: "$2.46M monthly recognized revenue." },
    { title: "Open shipments", detail: "1,248 active jobs tracked live." },
    { title: "Overdue invoices", detail: "$37K over 60 days." },
    { title: "Gross profit", detail: "21.4% weighted GP." },
    { title: "Duty summary", detail: "$418K customs duties processed." }
  ],
  heatmap: [
    { title: "US", detail: "High import volume, customs-heavy." },
    { title: "China", detail: "Ocean and air export concentration." },
    { title: "India", detail: "Road-air multimodal growth." },
    { title: "EU", detail: "Strong duty and broker workload." },
    { title: "UAE", detail: "Express and transshipment focus." },
    { title: "Singapore", detail: "Regional hub and consolidation." }
  ],
  scorecards: [
    { title: "Lufthansa Cargo", detail: "96.4% on-time, low exception rate." },
    { title: "Maersk", detail: "92.1% schedule adherence, stable detention profile." },
    { title: "DHL Global Forwarding", detail: "95.2% quote turnaround within SLA." }
  ],
  stack: [
    { title: "Frontend", detail: "React + TypeScript + Tailwind CSS for fast, typed UI iteration." },
    { title: "Backend", detail: "NestJS or FastAPI with modular services and REST/GraphQL boundaries." },
    { title: "Data", detail: "PostgreSQL primary store, Redis cache and jobs, Elasticsearch search layer." },
    { title: "Files & Docs", detail: "S3 or GCS object storage with Puppeteer/WeasyPrint PDF generation." },
    { title: "Messaging", detail: "SendGrid or SES for transactional email plus Bull job workers." },
    { title: "Hosting", detail: "AWS ECS + RDS or equivalent GCP stack with CI/CD via GitHub Actions." }
  ],
  integrations: [
    { title: "US CBP / ACE", detail: "Phase 1 customs filing support through EDI X12/ANSI pathways." },
    { title: "IATA CargoIS", detail: "Air cargo rates and tracking feeds." },
    { title: "Stripe", detail: "Online invoice payment and portal settlement flows." },
    { title: "DocuSign", detail: "Document signature workflows for freight paperwork." },
    { title: "SendGrid", detail: "Transactional notifications, reminders, and report delivery." },
    { title: "QuickBooks / Xero / SAP", detail: "Phase 2+ accounting and ERP sync options." }
  ],
  tenants: [
    { title: "Tenant isolation", detail: "Dedicated schema or database boundaries with platform-level governance." },
    { title: "Brand personalization", detail: "Logo, color system, custom document templates, and customer-facing domains." },
    { title: "Feature flags", detail: "Enable or disable WMS, CRM, reporting, and integrations per tenant." }
  ],
  roadmap: [
    { title: "Phase 1 | Core MVP", detail: "Shipment management, basic customs, branded docs, AR invoicing, portal, auth, RBAC, dashboard." },
    { title: "Phase 2 | Compliance & Finance", detail: "AES, ISF, CBP 7501, sanctions screening, AP module, GP analytics, advanced reporting." },
    { title: "Phase 3 | Transport & WMS", detail: "Carrier integrations, rate management, consolidation, warehouse workflows, and mobile apps." },
    { title: "Phase 4 | Enterprise & Scale", detail: "Multi-tenancy, white-label domains, EDI, ERP sync, report builder, SLA monitoring." }
  ],
  pricing: [
    { plan: "Starter", price: "$499/mo", copy: "3 users, 50 jobs, core workflows, email support." },
    { plan: "Professional", price: "$1,499/mo", copy: "15 users, all modules, CRM, phone support.", highlight: true },
    { plan: "Business", price: "$3,999/mo", copy: "50 users, unlimited jobs, WMS, custom templates, SLA." },
    { plan: "Enterprise", price: "Custom", copy: "Unlimited users, white-label, EDI, ERP integrations, dedicated support." }
  ],
  nfrs: [
    { title: "API response", detail: "< 300ms at p95 under normal load." },
    { title: "Uptime SLA", detail: "99.9% annually." },
    { title: "Concurrent users", detail: "Support 5,000 concurrent users per tenant." },
    { title: "File uploads", detail: "100MB per document with unlimited files per job." },
    { title: "Retention", detail: "Shipment data retained for 7 years." },
    { title: "Disaster recovery", detail: "< 4 hour recovery objective with point-in-time restore." }
  ]
};

const viewTitles = {
  overview: "Control Tower",
  operations: "Shipment Workspace",
  compliance: "Customs & Compliance",
  finance: "Finance Command",
  warehouse: "Warehouse Operations",
  crm: "CRM & Quotes",
  analytics: "Reporting & Analytics",
  platform: "Platform Plan"
};

const renderSimpleGrid = (targetId, items, formatter) => {
  const root = document.getElementById(targetId);
  root.innerHTML = items.map(formatter).join("");
};

const renderBoard = () => {
  renderSimpleGrid(
    "shipment-board",
    data.shipmentBoard,
    (column) => `
      <div class="board-column searchable">
        <h4>${column.stage}</h4>
        <div class="board-stack">
          ${column.items
            .map(
              (job) => `
                <article class="job-card searchable">
                  <strong>${job.id}</strong>
                  <p>${job.route}</p>
                  <p>Owner: ${job.owner}</p>
                  <div class="job-meta">
                    ${job.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    `
  );
};

const renderFinance = () => {
  renderSimpleGrid(
    "revenue-chart",
    data.revenue,
    (item) => `
      <div class="bar-group searchable">
        <div class="bar" style="height: ${item.value * 2.2}px"></div>
        <strong>${item.month}</strong>
        <span class="bar-value">$${item.value}0K</span>
      </div>
    `
  );

  renderSimpleGrid(
    "finance-highlights",
    data.financeHighlights,
    (item) => `
      <div class="ledger-strip searchable">
        <div>
          <p>${item.label}</p>
          <strong>${item.value}</strong>
        </div>
        <p>${item.note}</p>
      </div>
    `
  );
};

const renderChips = () => {
  renderSimpleGrid(
    "operations-checklist",
    data.operationsChecklist,
    (item) => `<span class="chip searchable">${item}</span>`
  );
};

const initializeContent = () => {
  renderSimpleGrid("hero-stats", data.heroStats, (item) => `<div class="mini-stat"><span>${item.label}</span><strong>${item.value}</strong></div>`);
  renderSimpleGrid("pulse-board", data.pulse, (item) => `<div class="metric-tile searchable"><span>${item.label}</span><strong>${item.value}</strong><p>${item.note}</p></div>`);
  renderSimpleGrid("role-list", data.roles, (item) => `<div class="role-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("launch-list", data.launch, (item) => `<div class="timeline-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("artifact-list", data.artifacts, (item) => `<div class="artifact-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("module-grid", data.modules, (item) => `<div class="module-card searchable"><strong>${item.title}</strong><p>${item.text}</p></div>`);
  renderSimpleGrid("document-list", data.documents, (item) => `<div class="document-item searchable"><div class="document-head"><strong>${item.name}</strong><span class="badge ${item.status === "Ready" ? "ok" : item.status === "Pending" ? "info" : "alert"}">${item.status}</span></div><p>${item.meta}</p></div>`);
  renderSimpleGrid("carrier-list", data.carriers, (item) => `<div class="carrier-item searchable"><strong>${item.name}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("compliance-grid", data.compliance, (item) => `<div class="compliance-card searchable"><strong>${item.title}</strong><ul>${item.items.map((entry) => `<li>${entry}</li>`).join("")}</ul></div>`);
  renderSimpleGrid("screening-list", data.screening, (item) => `<div class="screening-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("security-list", data.security, (item) => `<div class="security-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("aging-list", data.aging, (item) => `<div class="aging-item searchable"><strong>${item.bucket} | ${item.amount}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("margin-list", data.margins, (item) => `<div class="alert-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("warehouse-flow", data.warehouseFlow, (item) => `<div class="warehouse-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("warehouse-metrics", data.warehouseMetrics, (item) => `<div class="metric-tile searchable"><span>${item.label}</span><strong>${item.value}</strong><p>${item.note}</p></div>`);
  renderSimpleGrid("mobile-list", data.mobileApps, (item) => `<div class="mobile-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("stock-list", data.stock, (item) => `<div class="stock-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("crm-pipeline", data.crmStages, (item) => `<div class="crm-stage searchable"><h4>${item.title}</h4><p>${item.detail}</p></div>`);
  renderSimpleGrid("portal-cards", data.portalCards, (item) => `<div class="portal-card searchable"><strong>${item.value}</strong><p>${item.title}</p><p>${item.note}</p></div>`);
  renderSimpleGrid("portal-feature-list", data.portalFeatures, (item) => `<div class="feature-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("quote-list", data.quotes, (item) => `<div class="quote-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("kpi-grid", data.kpis, (item) => `<div class="kpi-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("heatmap-grid", data.heatmap, (item) => `<div class="heatmap-cell searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("score-list", data.scorecards, (item) => `<div class="score-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("stack-grid", data.stack, (item) => `<div class="stack-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("integration-list", data.integrations, (item) => `<div class="integration-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("tenant-grid", data.tenants, (item) => `<div class="tenant-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("roadmap-list", data.roadmap, (item) => `<div class="roadmap-item searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderSimpleGrid("pricing-grid", data.pricing, (item) => `<div class="pricing-card searchable ${item.highlight ? "highlight" : ""}"><strong>${item.plan}</strong><strong>${item.price}</strong><p>${item.copy}</p></div>`);
  renderSimpleGrid("nfr-list", data.nfrs, (item) => `<div class="nfr-card searchable"><strong>${item.title}</strong><p>${item.detail}</p></div>`);
  renderBoard();
  renderFinance();
  renderChips();
};

const setView = (view) => {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });

  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.viewPanel === view);
  });

  document.getElementById("view-title").textContent = viewTitles[view];
};

const setupNavigation = () => {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewJump));
  });
};

const setupThemeToggle = () => {
  const toggle = document.getElementById("theme-toggle");
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    localStorage.setItem("cargoclear-theme", theme);
  };

  applyTheme(localStorage.getItem("cargoclear-theme") || "light");

  toggle.addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
  });
};

const setupSearch = () => {
  const input = document.getElementById("global-search");
  const searchable = () => Array.from(document.querySelectorAll(".searchable"));

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();

    searchable().forEach((node) => {
      const match = query && node.textContent.toLowerCase().includes(query);
      node.classList.toggle("search-hit", Boolean(match));
    });
  });
};

initializeContent();
setupNavigation();
setupThemeToggle();
setupSearch();
setView("overview");
