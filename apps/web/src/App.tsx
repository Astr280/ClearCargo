import { Box, CircularProgress } from "@mui/material";
import type { ModuleKey } from "@shared/index";
import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { canAccessModule } from "./auth/access";
import AppLayout from "./layouts/AppLayout";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import CompliancePage from "./pages/CompliancePage";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import FinancePage from "./pages/FinancePage";
import LoginPage from "./pages/LoginPage";
import PlatformPage from "./pages/PlatformPage";
import ShipmentDetailPage from "./pages/ShipmentDetailPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import WarehousePage from "./pages/WarehousePage";

function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireModule({ moduleKey, children }: { moduleKey: ModuleKey; children: ReactElement }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessModule(session.user.role, session.tenant, moduleKey)) {
    return <AccessDeniedPage />;
  }

  return children;
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <RequireModule moduleKey="dashboard">
              <DashboardPage />
            </RequireModule>
          }
        />
        <Route
          path="/shipments"
          element={
            <RequireModule moduleKey="shipments">
              <ShipmentsPage />
            </RequireModule>
          }
        />
        <Route
          path="/shipments/:id"
          element={
            <RequireModule moduleKey="shipments">
              <ShipmentDetailPage />
            </RequireModule>
          }
        />
        <Route
          path="/compliance"
          element={
            <RequireModule moduleKey="compliance">
              <CompliancePage />
            </RequireModule>
          }
        />
        <Route
          path="/finance"
          element={
            <RequireModule moduleKey="finance">
              <FinancePage />
            </RequireModule>
          }
        />
        <Route
          path="/warehouse"
          element={
            <RequireModule moduleKey="warehouse">
              <WarehousePage />
            </RequireModule>
          }
        />
        <Route
          path="/customers"
          element={
            <RequireModule moduleKey="customers">
              <CustomersPage />
            </RequireModule>
          }
        />
        <Route
          path="/platform"
          element={
            <RequireModule moduleKey="platform">
              <PlatformPage />
            </RequireModule>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
