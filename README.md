# CargoClear

CargoClear is an enterprise freight forwarding and logistics platform being built to compete in the CargoWise-class operating space. This repository contains the active full-stack application foundation for shipment operations, customs workflows, finance, warehouse execution, CRM/quoting, customer portal access, and tenant-aware platform administration.

This project is no longer a marketing mockup. It is a working monorepo with a React frontend, a TypeScript API, role-based access control, tenant-scoped data handling, document workflows, invoice operations, quote conversion, and an operational path toward PostgreSQL-backed persistence.

## Table of contents

- [Product status](#product-status)
- [Implemented capabilities](#implemented-capabilities)
- [Technology profile](#technology-profile)
- [Architecture and operating model](#architecture-and-operating-model)
- [Security and compliance posture](#security-and-compliance-posture)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Demo access](#demo-access)
- [Persistence modes](#persistence-modes)
- [API overview](#api-overview)
- [Development workflow](#development-workflow)
- [Documentation](#documentation)
- [Current limitations](#current-limitations)
- [Roadmap priorities](#roadmap-priorities)

## Product status

CargoClear is currently in the application-foundation stage.

What is production-style today:

- Multi-module web workspace for operations, finance, warehouse, CRM, customer portal, and platform administration
- Role-based access control with tenant-aware scoping
- Shipment CRUD and shipment detail workbooks
- Document approval, version history, and customer visibility controls
- Invoice tracking and payment recording
- CRM quotation workflows with quote-to-shipment conversion
- Branded document rendering for invoices and quotes
- JSON-backed demo persistence with PostgreSQL integration path and sync tooling

What is still in progress:

- Fully normalized PostgreSQL schema and migrations
- Real identity provider integration
- External freight, customs, maps, FX, e-signature, OCR, and payment APIs
- Background jobs, async workers, and production observability
- Formal compliance controls and deployment hardening

## Implemented capabilities

### Operations and shipment management

- Shipment register with create, edit, delete, and stage progression
- Shipment detail workspace with milestones, notes, flags, and linked documents
- Tenant-aware shipment visibility
- Customer portal scoping so customer users only see their own account data

### Document management

- Shipment document upload metadata
- Approval states: `Draft`, `Ready`, `Approved`, `Signed`
- Version history with uploader attribution and notes
- Internal-only versus customer-visible document controls
- Branded quote and invoice document rendering

### Finance and billing

- Invoice register
- Payment recording flow
- Finance summary views
- Customer portal invoice visibility and pay-now flow

### CRM and quotation

- Customer and contact visibility
- Quote creation with line items
- Quote stage progression
- Quote validity tracking
- Quote-to-shipment conversion

### Identity, tenancy, and platform controls

- Demo login with MFA-style verification
- Role-aware route protection
- Tenant branding support
- Admin-only persistence visibility and sync actions

## Technology profile

### Current implementation

- Frontend: React 19, TypeScript, Vite, MUI
- API: Node.js, Express 5, TypeScript
- Workspace: npm workspaces monorepo
- Demo persistence: JSON files in `data/`
- Optional persistence path: PostgreSQL via `pg`

### Target platform direction from the product specification

- Primary database: PostgreSQL
- Search: Elasticsearch
- Caching and jobs: Redis plus Bull
- File storage: AWS S3 or Google Cloud Storage
- PDF generation: Puppeteer or WeasyPrint
- OCR: AWS Textract or Google Vision API
- Email: SendGrid or AWS SES
- Authentication: Auth0 or Supabase Auth
- Hosting: AWS or GCP

## Architecture and operating model

The repository follows a modular monorepo structure intended to support domain separation and future service extraction.

- `apps/web` provides the operator and portal user interface
- `apps/api` provides authenticated platform APIs and workflow logic
- `packages/shared` contains shared domain types and seed data contracts
- `data` contains demo-state JSON used for local development and fallback persistence

Current data flow:

1. The web app authenticates against the API using demo credentials.
2. The API issues an in-memory session token and enforces RBAC plus tenant scoping.
3. Domain services load and mutate shipment, document, invoice, quote, and customer state.
4. Mutations persist to JSON by default and can also be synchronized to PostgreSQL when `DATABASE_URL` is configured.

This design keeps the current developer experience simple while preserving a clear migration path toward a relational, multi-tenant production architecture.

## Security and compliance posture

CargoClear is being developed with enterprise controls in mind, but this repository is not yet a certified production system.

Current security-oriented foundations:

- Role-based access control on protected API routes
- Tenant-scoped data access
- MFA-style login flow in the demo experience
- Admin-only platform controls for persistence visibility and synchronization
- Clear service boundaries for future audit and hardening work

Target compliance direction from the product specification:

- SOC 2 Type II aligned architecture
- GDPR-aware data handling
- AES-256 at-rest encryption
- TLS 1.3 in transit
- Full audit logging
- Sanctions screening and customs auditability
- Multi-factor authentication for all users

Important note: these are design targets, not claims of current certification or legal compliance.

## Repository structure

```text
.
|- apps/
|  |- api/        # Express + TypeScript API
|  \- web/        # React + Vite frontend
|- assets/        # Brand assets
|- data/          # Demo persistence and seed state
|- docs/          # Architecture and implementation notes
|- packages/
|  \- shared/     # Shared types and platform contracts
|- package.json   # Workspace scripts
\- README.md
```

Key implementation files:

- `apps/web/src/App.tsx`
- `apps/web/src/layouts/AppLayout.tsx`
- `apps/web/src/pages/ShipmentsPage.tsx`
- `apps/web/src/pages/ShipmentDetailPage.tsx`
- `apps/web/src/pages/FinancePage.tsx`
- `apps/web/src/pages/CustomersPage.tsx`
- `apps/web/src/pages/PlatformPage.tsx`
- `apps/api/src/server.ts`
- `apps/api/src/routes/platform.ts`
- `apps/api/src/services/platform-data.ts`
- `apps/api/src/services/auth.ts`
- `apps/api/src/services/database.ts`
- `packages/shared/src/index.ts`

## Getting started

### Prerequisites

- Node.js 20 or newer recommended
- npm 10 or newer recommended
- PostgreSQL 15 or newer optional for database-backed persistence

### Install dependencies

```bash
npm install
```

### Run the API

```bash
npm run dev:api
```

The API starts on `http://127.0.0.1:4000` by default.

### Run the web app

In a second terminal:

```bash
npm run dev:web
```

The frontend starts on `http://127.0.0.1:5173` in Vite development mode.

### Build for verification

```bash
npm run build:api
npm run build:web
```

### Database sync command

When PostgreSQL is configured:

```bash
npm run db:sync:api
```

## Environment configuration

The API supports optional PostgreSQL-backed persistence through `DATABASE_URL`.

Example file:

[`apps/api/.env.example`](apps/api/.env.example)

Example value:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cargoclear
```

If `DATABASE_URL` is not configured, CargoClear runs in JSON-backed demo mode.

## Demo access

All demo users currently use the same credentials:

- Password: `CargoClear!2026`
- MFA code: `123456`

Available demo accounts:

| Role | Email | Tenant |
| --- | --- | --- |
| System Admin | `admin@cargoclear.demo` | CargoClear |
| Freight Coordinator | `freight@cargoclear.demo` | CargoClear |
| Customs Broker | `customs@cargoclear.demo` | CargoClear |
| Finance / Billing | `finance@cargoclear.demo` | CargoClear |
| Warehouse Manager | `warehouse@cargoclear.demo` | CargoClear |
| Operations Manager | `ops@cargoclear.demo` | CargoClear |
| Customer | `portal@atlas.demo` | Atlas Retail Group |

## Persistence modes

CargoClear currently supports two persistence modes.

### 1. JSON fallback mode

- Uses files in `data/`
- Best for local demos and fast iteration
- No external infrastructure required

### 2. PostgreSQL mode

- Enabled when `DATABASE_URL` is present
- Initializes application persistence tables
- Supports sync from in-memory/demo state into PostgreSQL
- Exposes admin-only persistence visibility in the Platform module

Current implementation note:

The PostgreSQL layer presently uses JSONB-backed entity tables as an operational bridge. This provides immediate database persistence while the platform evolves toward a more normalized relational model.

## API overview

Representative API areas currently available:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `GET /api/dashboard`
- `GET /api/shipments`
- `POST /api/shipments`
- `PUT /api/shipments/:id`
- `PATCH /api/shipments/:id/stage`
- `GET /api/shipments/:id/detail`
- `POST /api/shipments/:id/documents`
- `PATCH /api/shipments/:id/documents/:documentId`
- `POST /api/shipments/:id/documents/:documentId/versions`
- `GET /api/finance/summary`
- `GET /api/finance/invoices`
- `POST /api/finance/invoices/:id/payments`
- `GET /api/crm/quotes`
- `POST /api/crm/quotes`
- `PATCH /api/crm/quotes/:id/stage`
- `POST /api/crm/quotes/:id/convert`
- `GET /api/platform/overview`
- `GET /api/platform/persistence`
- `POST /api/platform/persistence/sync`

All protected routes require a valid session token and are filtered by role plus tenant context.

## Development workflow

Recommended local workflow:

1. Install dependencies with `npm install`.
2. Start the API with `npm run dev:api`.
3. Start the frontend with `npm run dev:web`.
4. Log in with a role-specific demo user.
5. Verify current behavior through the relevant module.
6. Run `npm run build:api` and `npm run build:web` before pushing changes.

Engineering expectations for this repository:

- Keep product behavior tenant-aware
- Preserve RBAC boundaries when adding endpoints or UI actions
- Prefer shared domain types in `packages/shared`
- Keep README, architecture notes, and implementation docs aligned with code changes
- Distinguish clearly between implemented behavior and planned/spec-level intent

## Documentation

Supporting documents:

- [Architecture notes](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [GitHub publish notes](docs/github-publish.md)

## Current limitations

This repository is a strong application starter, not yet a complete enterprise logistics platform.

Known gaps:

- No production identity provider yet
- No real external customs, carrier, payment, or FX integrations yet
- No OCR or e-signature integration yet
- No background worker or queue infrastructure yet
- No normalized relational PostgreSQL schema in active runtime use yet
- No formal audit trail, observability stack, or deployment pipeline yet
- No mobile apps yet

## Roadmap priorities

The most valuable next steps are:

1. Normalize the PostgreSQL data model and introduce migrations
2. Move session and business data from demo-only foundations to production-ready auth and persistence
3. Add real third-party integrations for payments, FX, customs, and carrier intelligence
4. Expand document generation into shipment document templates and export-ready PDFs
5. Introduce audit logging, queues, notifications, and observability

## License

No license file has been added yet. Treat this repository as private and proprietary until a formal license is published.
