import type { ModuleKey, TenantConfig, UserRole } from "@shared/index";

export const moduleAccess: Record<ModuleKey, UserRole[]> = {
  dashboard: ["Freight Coordinator", "Customs Broker", "Finance / Billing", "Warehouse Manager", "Operations Manager", "System Admin", "Customer"],
  shipments: ["Freight Coordinator", "Customs Broker", "Operations Manager", "System Admin", "Customer"],
  compliance: ["Customs Broker", "Operations Manager", "System Admin"],
  finance: ["Finance / Billing", "Operations Manager", "System Admin"],
  warehouse: ["Warehouse Manager", "Operations Manager", "System Admin"],
  customers: ["Freight Coordinator", "Operations Manager", "System Admin", "Customer"],
  platform: ["System Admin"]
};

export function canAccessModule(role: UserRole, tenant: TenantConfig, moduleKey: ModuleKey) {
  return tenant.enabledModules.includes(moduleKey) && moduleAccess[moduleKey].includes(role);
}

export function canMutateShipments(role: UserRole) {
  return ["Freight Coordinator", "Operations Manager", "System Admin"].includes(role);
}

export function canManageShipmentDocuments(role: UserRole) {
  return ["Freight Coordinator", "Customs Broker", "Operations Manager", "System Admin"].includes(role);
}
