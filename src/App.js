import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Workers from "./pages/Workers";
import SalaryReport from "./pages/SalaryReport";
import Analytics from "./pages/Analytics";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./pages/PrivateRoute";
import AdminRoute from "./pages/AdminRoute";
import Profile from "./pages/Profile";
import DailyReport from "./pages/DailyReport";
import InvoiceView from "./pages/InvoiceView";
import InvoicePage from "./pages/InvoicePage";
import InvoiceHistoryPage from "./pages/InvoiceHistoryPage";
import ProfitPage from "./pages/ProfitPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route path="/auth" element={<AuthPage />} />

        {/* ================= PUBLIC BILL ================= */}
        <Route path="/bill/:id" element={<InvoiceView />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* MAIN */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="production" element={<Production />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="workers" element={<Workers />} />
          <Route path="profile" element={<Profile />} />

          {/* INVOICE */}
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="invoice/:id" element={<InvoiceView />} />
          <Route path="history" element={<InvoiceHistoryPage />} />

          {/* REPORTS */}
          <Route path="salary" element={<SalaryReport />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="daily-report" element={<DailyReport />} />
          <Route path="profit" element={<ProfitPage />} />
        </Route>

        {/* ================= STAFF ================= */}
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* MAIN */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="production" element={<Production />} />
          <Route path="workers" element={<Workers />} />
          <Route path="profile" element={<Profile />} />

          {/* INVOICE */}
          <Route path="invoices" element={<InvoicePage />} />
        </Route>

        {/* ================= ROOT REDIRECT ================= */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/auth" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;