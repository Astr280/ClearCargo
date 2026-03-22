# CargoClear

CargoClear is now structured as a real application starter instead of a single static prototype.

## Workspace layout

- `apps/web`: React + TypeScript frontend
- `apps/api`: Node + TypeScript API
- `packages/shared`: shared freight-domain models and seeded mock platform data
- `assets`: CargoClear brand assets
- `data/schema.sql`: starter relational schema
- `docs`: planning and architecture notes

## Product scope represented

- Shipment management
- Customs and compliance
- Finance and billing
- Warehouse management
- CRM and quotation
- Customer portal
- Reporting and analytics
- Platform architecture and multi-tenancy

## Run locally

Install dependencies from the repo root:

```bash
npm install
```

Start the API:

```bash
npm run dev:api
```

Start the web app in another terminal:

```bash
npm run dev:web
```

## What is implemented right now

- A real routed React frontend shell for the main platform modules
- A TypeScript API with module-oriented endpoints
- Shared domain models and seeded mock operational data
- Starter PostgreSQL schema for future backend persistence

## What is still not fully built

- Database persistence
- Real authentication
- Real customs / carrier / payment integrations
- OCR, PDF rendering, and queue workers
- Full CRUD flows and production-grade validation
