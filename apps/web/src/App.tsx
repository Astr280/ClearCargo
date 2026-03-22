import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import CompliancePage from "./pages/CompliancePage";
import FinancePage from "./pages/FinancePage";
import WarehousePage from "./pages/WarehousePage";
import CustomersPage from "./pages/CustomersPage";
import PlatformPage from "./pages/PlatformPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/platform" element={<PlatformPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
