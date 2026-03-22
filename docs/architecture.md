# Architecture Notes

## Recommended stack

- Frontend: React + TypeScript + Tailwind CSS
- Mobile: React Native
- API: NestJS or FastAPI
- Primary database: PostgreSQL
- Search: Elasticsearch
- Cache and queues: Redis + Bull
- File storage: AWS S3 or Google Cloud Storage
- PDF generation: Puppeteer or WeasyPrint
- OCR: AWS Textract or Google Vision API

## Service boundaries

- Identity and RBAC
- Tenant configuration and branding
- Shipment operations
- Customs and compliance
- Document generation and storage
- Finance and billing
- Warehouse management
- CRM and quoting
- Reporting and analytics
- Integration gateway

## Multi-tenancy

- Prefer schema-per-tenant or database-per-tenant isolation.
- Keep platform-level services for auth, billing, and tenant provisioning.
- Tenant-configurable assets should include logo, color palette, templates, domains, and feature flags.

## Deployment direction

- Containerized services via Docker
- CI/CD through GitHub Actions
- Deploy to AWS ECS + RDS or equivalent GCP services
- Centralized logs, audit trails, metrics, and alerting from day one

## Security baseline

- TLS 1.3 in transit
- AES-256 at rest
- MFA required
- Full audit logging
- GDPR-aware data retention and erasure workflows
- Penetration testing before launch
