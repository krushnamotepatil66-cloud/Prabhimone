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
import PlanStatusWidget, { ShortPlanBadge } from "../../components/DashboardHome/PlanStatusWidget";

import "./Dashboard.css";

function Dashboard() {
  const { profile, settings } = useApp();
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      {/* Zoho Custom Dashboard Header */}
      <div className="zoho-dashboard-header">
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {settings.companyLogo && (
            <img src={settings.companyLogo} alt="Company Logo" style={{ height: "64px", width: "auto", objectFit: "contain", borderRadius: "6px" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 className="welcome-title" style={{ margin: "0 0 4px 0" }}>{profile.name}</h2>
            <p className="company-subtitle" style={{ margin: 0 }}>{settings.companyName}</p>
          </div>
        </div>

        {/* Short Plan Info Badge */}
        <div className="header-right">
          <ShortPlanBadge />
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
          <PlanStatusWidget />
          <RecentInvoices />
          <TopExpensesChart />
          <RecentUpdates />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;