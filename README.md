# CargoClear

CargoClear is an enterprise freight forwarding platform being built to cover the operational scope of products like CargoWise One. This repository is no longer a simple landing page or static mockup. It is a working full-stack starter with a React frontend, a TypeScript API, role-based access, tenant-aware data scoping, shipment operations, document controls, finance workflows, and a CRM/quotation workspace.

## Current product coverage

The application currently includes working foundations for:

- Shipment management
- Customs and compliance dashboards
- Finance and billing summaries
- Warehouse operations views
- CRM and quotation workflows
- Customer portal access
- Platform administration and tenancy views

## Implemented right now

### Frontend

- React + TypeScript application in `apps/web`
- Routed module workspace for dashboard, shipments, customs, finance, warehouse, customers, and platform
- Tenant-branded application shell using the CargoClear visual system
- Role-aware navigation and protected routes

### API

- Node + TypeScript API in `apps/api`
- Session-based demo authentication with MFA-style verification
- Tenant-aware and role-aware endpoint protection
- JSON-backed persistence for core demo data

### Working business workflows

- Shipment CRUD with stage progression
- Shipment detail workbooks with milestones, notes, and flags
- Shipment document upload, approval, version history, and customer visibility control
- Invoice listing and payment recording
- Customer portal scoping so portal users only see their own account data
- CRM quote register with:
  - quote pipeline stages
  - quote validity dates
  - customer contacts and sales activity
  - quote creation
  - one-click quote-to-shipment conversion

## Workspace layout

- `apps/web` - React frontend
- `apps/api` - TypeScript API
- `packages/shared` - shared domain models and seeded freight data
- `data` - JSON persistence used by the current demo build
- `assets` - CargoClear brand assets
- `docs` - architecture and implementation notes

## Local development

Install dependencies from the repository root:

```bash
npm install
```

Start the API:

```bash
npm run dev:api
```

Start the web app in a second terminal:

```bash
npm run dev:web
```

Production builds:

```bash
npm run build:api
npm run build:web
```

## Demo access

All demo users currently use:

- Password: `CargoClear!2026`
- MFA code: `123456`

Suggested demo accounts:

- System admin: `admin@cargoclear.demo`
- Freight coordinator: `freight@cargoclear.demo`
- Customs broker: `customs@cargoclear.demo`
- Finance: `finance@cargoclear.demo`
- Warehouse: `warehouse@cargoclear.demo`
- Operations: `ops@cargoclear.demo`
- Customer portal: `portal@atlas.demo`

## Key repository files

- `apps/web/src/pages/ShipmentsPage.tsx` - shipment register and job actions
- `apps/web/src/pages/ShipmentDetailPage.tsx` - shipment workbook with milestones and documents
- `apps/web/src/pages/FinancePage.tsx` - finance and invoice workspace
- `apps/web/src/pages/CustomersPage.tsx` - CRM, quoting, and portal account workspace
- `apps/api/src/routes/platform.ts` - application API routes
- `apps/api/src/services/platform-data.ts` - tenant-aware data services and workflow logic
- `apps/api/src/services/auth.ts` - demo auth and session handling
- `packages/shared/src/index.ts` - shared platform types and seed data

## Current limitations

This repository is still a serious starter rather than a finished production system. The following areas are still planned:

- PostgreSQL-backed persistence instead of JSON files
- Real authentication provider integration
- Real customs, carrier, maps, FX, and payment APIs
- PDF document generation
- OCR and e-signature integrations
- background jobs, queues, and worker processes
- deeper validation, audit controls, and production hardening

## Recommended next steps

The strongest next implementation steps are:

1. PostgreSQL-backed persistence and relational data models
2. Quote and invoice PDF generation
3. Real auth and tenant onboarding
4. External integrations from the product spec

## Supporting docs

- `docs/architecture.md`
- `docs/implementation-plan.md`
- `docs/github-publish.md`

