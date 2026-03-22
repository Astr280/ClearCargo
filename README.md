# CargoClear

CargoClear is a CargoWise-class freight forwarding platform concept translated into a working frontend starter plus delivery artifacts.

## What is in this repo

- A branded product prototype covering operations, customs, finance, warehouse, CRM, analytics, and platform architecture.
- Local preview server with no external dependencies.
- Architecture and implementation docs derived from the developer specification.
- A sample PostgreSQL schema to ground future backend work.

## Run locally

```bash
npm start
```

Then open `http://localhost:4173`.

## Repo structure

- `index.html`: app shell and product sections
- `styles.css`: visual system and responsive layout
- `app.js`: data-driven UI rendering and interactions
- `server.js`: lightweight local preview server
- `assets/`: CargoClear logo assets
- `docs/`: architecture and planning notes
- `data/schema.sql`: starter relational schema

## Suggested next build steps

1. Migrate the frontend into React + TypeScript as recommended in the spec.
2. Stand up a NestJS or FastAPI backend with PostgreSQL and Redis.
3. Implement auth, tenancy, and shipment CRUD first.
4. Add document generation and customer portal flows.
5. Layer customs filing workflows, finance, WMS, and integrations phase by phase.
