import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Verify from "../pages/Verify";

import Dashboard from "../pages/dashboard/Dashboard";
import Invoices from "../pages/dashboard/Invoices";
import Customers from "../pages/dashboard/Customers";
import Items from "../pages/dashboard/Items";
import Estimates from "../pages/dashboard/Estimates";
import CreditNotes from "../pages/dashboard/CreditNotes";
import ProformaInvoices from "../pages/dashboard/ProformaInvoices";
import Payments from "../pages/dashboard/Payments";
import Expenses from "../pages/dashboard/Expenses";
import Reports from "../pages/dashboard/Reports";
import Settings from "../pages/dashboard/Settings";
import Profile from "../pages/dashboard/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />

      {/* Protected dashboard routes — requires JWT token */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/dashboard/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/dashboard/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/dashboard/products" element={<ProtectedRoute><Items /></ProtectedRoute>} />
      <Route path="/dashboard/estimates" element={<ProtectedRoute><Estimates /></ProtectedRoute>} />
      <Route path="/dashboard/credit-notes" element={<ProtectedRoute><CreditNotes /></ProtectedRoute>} />
      <Route path="/dashboard/proforma-invoices" element={<ProtectedRoute><ProformaInvoices /></ProtectedRoute>} />
      <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/dashboard/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;