import crypto from "node:crypto";
import type { AppUser, AuthSession, LoginRequest, TenantConfig, UserRole } from "../../../../packages/shared/src/index.js";
import { tenants } from "../../../../packages/shared/src/index.js";

interface SeedUser extends AppUser {
  password: string;
  mfaCode: string;
}

const seedUsers: SeedUser[] = [
  {
    id: "user-freight-1",
    tenantId: "tenant-cargoclear",
    name: "Ava Mehta",
    email: "freight@cargoclear.demo",
    role: "Freight Coordinator",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-customs-1",
    tenantId: "tenant-cargoclear",
    name: "Rahul Broker",
    email: "customs@cargoclear.demo",
    role: "Customs Broker",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-finance-1",
    tenantId: "tenant-cargoclear",
    name: "Dana Chen",
    email: "finance@cargoclear.demo",
    role: "Finance / Billing",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-warehouse-1",
    tenantId: "tenant-cargoclear",
    name: "Omar Khan",
    email: "warehouse@cargoclear.demo",
    role: "Warehouse Manager",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-ops-1",
    tenantId: "tenant-cargoclear",
    name: "Priya Singh",
    email: "ops@cargoclear.demo",
    role: "Operations Manager",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-admin-1",
    tenantId: "tenant-cargoclear",
    name: "Adi Admin",
    email: "admin@cargoclear.demo",
    role: "System Admin",
    password: "CargoClear!2026",
    mfaCode: "123456"
  },
  {
    id: "user-customer-1",
    tenantId: "tenant-atlas",
    name: "Northwind Portal",
    email: "portal@atlas.demo",
    role: "Customer",
    password: "CargoClear!2026",
    mfaCode: "123456"
  }
];

const sessionStore = new Map<string, AuthSession>();

function withoutSecrets(user: SeedUser): AppUser {
  return {
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function findTenant(tenantId: string): TenantConfig {
  const tenant = tenants.find((item) => item.id === tenantId);

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found.`);
  }

  return tenant;
}

export function getDemoAccounts() {
  return seedUsers.map((user) => ({
    email: user.email,
    name: user.name,
    role: user.role,
    tenantName: findTenant(user.tenantId).name
  }));
}

export function login(payload: LoginRequest) {
  const user = seedUsers.find((item) => item.email.toLowerCase() === payload.email.trim().toLowerCase());

  if (!user || user.password !== payload.password) {
    return {
      status: "invalid" as const,
      message: "Invalid email or password."
    };
  }

  if (payload.mfaCode !== user.mfaCode) {
    return {
      status: "mfa-required" as const,
      challenge: {
        email: user.email,
        role: user.role,
        tenantName: findTenant(user.tenantId).name
      }
    };
  }

  const session: AuthSession = {
    token: crypto.randomUUID(),
    user: withoutSecrets(user),
    tenant: findTenant(user.tenantId),
    mfaVerified: true
  };

  sessionStore.set(session.token, session);

  return {
    status: "success" as const,
    session
  };
}

export function getSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  return sessionStore.get(token) ?? null;
}

export function logout(token: string | undefined) {
  if (!token) {
    return;
  }

  sessionStore.delete(token);
}

export function userHasRole(role: UserRole, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(role);
}
