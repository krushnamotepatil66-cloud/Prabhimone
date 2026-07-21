import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";

// Widgets & Charts
import TotalReceivables from "../../components/DashboardHome/TotalReceivables";
import SalesAndExpensesChart from "../../components/Charts/SalesAndExpensesChart";
import SalesReceiptsDuesChart from "../../components/Charts/SalesReceiptsDuesChart";
import RecentInvoices from "../../components/DashboardHome/RecentInvoices";
import TopExpensesChart from "../../components/Charts/TopExpensesChart";
import RecentUpdates from "../../components/DashboardHome/RecentUpdates";

import "./Dashboard.css";

function Dashboard() {
  const { profile, settings } = useApp();
  const navigate = useNavigate();

  // Dropdown states
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <DashboardLayout>
      {/* Zoho Custom Dashboard Header */}
      <div className="zoho-dashboard-header">
        <div className="header-left">
          <h2 className="welcome-title">Hello, {profile.name}</h2>
          <p className="company-subtitle">{settings.companyName}</p>
        </div>

        <div className="header-right">
          <div className="quick-add-container">
            <button
              className="quick-add-btn"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              aria-haspopup="true"
              aria-expanded={showQuickAdd}
            >
              + New <span className="arrow">▼</span>
            </button>

            {showQuickAdd && (
              <>
                <div
                  className="quick-add-overlay-trigger"
                  onClick={() => setShowQuickAdd(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                    background: "transparent"
                  }}
                />
                <div className="quick-add-dropdown" style={{ zIndex: 100 }}>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/dashboard/invoices?action=new");
                      setShowQuickAdd(false);
                    }}
                  >
                    New Invoice
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/dashboard/customers?action=new");
                      setShowQuickAdd(false);
                    }}
                  >
                    New Customer
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/dashboard/payments?action=new");
                      setShowQuickAdd(false);
                    }}
                  >
                    Record Payment
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/dashboard/expenses?action=new");
                      setShowQuickAdd(false);
                    }}
                  >
                    New Expense
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Widget System */}
      <div className="zoho-dashboard-grid">
        {/* Left Column (Core Financial Metrics & Graphs) */}
        <div className="grid-left-col">
          <TotalReceivables />
          <SalesAndExpensesChart />
          <SalesReceiptsDuesChart />
        </div>

        {/* Right Column (Sidebar Lists & Breakdown Donuts) */}
        <div className="grid-right-col">
          <RecentInvoices />
          <TopExpensesChart />
          <RecentUpdates />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;