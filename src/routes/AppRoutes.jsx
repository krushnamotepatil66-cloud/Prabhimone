import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Verify from "../pages/Verify";

import Dashboard from "../pages/dashboard/Dashboard";
import Invoices from "../pages/dashboard/Invoices";
import Customers from "../pages/dashboard/Customers";
import Products from "../pages/dashboard/Products";
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
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/invoices" element={<Invoices />} />
      <Route path="/dashboard/customers" element={<Customers />} />
      <Route path="/dashboard/products" element={<Products />} />
      <Route path="/dashboard/estimates" element={<Estimates />} />
      <Route path="/dashboard/credit-notes" element={<CreditNotes />} />
      <Route path="/dashboard/proforma-invoices" element={<ProformaInvoices />} />
      <Route path="/dashboard/payments" element={<Payments />} />
      <Route path="/dashboard/expenses" element={<Expenses />} />
      <Route path="/dashboard/reports" element={<Reports />} />
      <Route path="/dashboard/settings" element={<Settings />} />
      <Route path="/dashboard/profile" element={<Profile />} />
    </Routes>
  );
}

export default AppRoutes;