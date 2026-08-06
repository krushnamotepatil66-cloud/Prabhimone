import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import { isFeatureAllowed } from "../../utils/subscriptionLimits";
import UpgradeGate from "../../components/Subscription/UpgradeGate";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import "./Reports.css";
import "../../pages/dashboard/Invoices.css";

function Reports() {
  const { invoices, payments, settings } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  const planName = settings?.subscriptionStatus === "cancelled" ? null : settings?.subscriptionPlan;
  const advancedReportsAllowed = isFeatureAllowed(planName, settings?.subscriptionStatus, "advancedReports");

  // Helper to parse amount
  const parseAmount = (amtStr) => {
    return Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;
  };

  // High level financial metrics
  const totalBilled = invoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalReceivables = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // 1. Data for Sales by Customer
  const salesByCustomerMap = {};
  invoices.forEach((inv) => {
    salesByCustomerMap[inv.customer] =
      (salesByCustomerMap[inv.customer] || 0) + parseAmount(inv.amount);
  });
  const salesByCustomerData = Object.entries(salesByCustomerMap).map(([name, amount]) => ({
    name: name.split(" ")[0], // Use first name for space
    Billed: amount,
  }));

  // 2. Data for Invoice Status distribution
  const statusCounts = { Paid: 0, Pending: 0, Overdue: 0 };
  invoices.forEach((inv) => {
    if (statusCounts[inv.status] !== undefined) {
      statusCounts[inv.status]++;
    } else {
      statusCounts[inv.status] = 1;
    }
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // 3. Collection Timeline: Daily sales vs payments
  // Let's group both invoices and payments by date
  const timelineMap = {};
  invoices.forEach((inv) => {
    const date = inv.date;
    if (!timelineMap[date]) timelineMap[date] = { date, Sales: 0, Payments: 0 };
    timelineMap[date].Sales += parseAmount(inv.amount);
  });
  payments.forEach((p) => {
    const date = p.date;
    if (!timelineMap[date]) timelineMap[date] = { date, Sales: 0, Payments: 0 };
    timelineMap[date].Payments += Number(p.amount);
  });
  // Sort timeline by date
  const timelineData = Object.values(timelineMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <DashboardLayout>
      <div className="reports-page">
        <div className="reports-header">
          <div>
            <h1>Business Reports</h1>
            <p className="subtitle">Track financial health, sales performance, and collections.</p>
          </div>
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => setActiveTab("sales")}
            >
              Sales Analytics
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="invoice-summary-cards">
          <div className="inv-summary-card total">
            <div className="inv-card-icon">🧾</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Total Billed Sales</span>
              <span className="inv-card-value">{settings.currency}{totalBilled.toLocaleString()}</span>
              <span className="inv-card-sub">Gross Invoice Value</span>
            </div>
          </div>
          <div className="inv-summary-card paid">
            <div className="inv-card-icon">✅</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Total Collections</span>
              <span className="inv-card-value">{settings.currency}{totalCollected.toLocaleString()}</span>
              <span className="inv-card-sub">Payments Recorded</span>
            </div>
          </div>
          <div className="inv-summary-card outstanding">
            <div className="inv-card-icon">⏳</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Net Receivables</span>
              <span className="inv-card-value">{settings.currency}{totalReceivables.toLocaleString()}</span>
              <span className="inv-card-sub">Outstanding Balance</span>
            </div>
          </div>
          <div className="inv-summary-card revenue">
            <div className="inv-card-icon">📈</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Collection Rate</span>
              <span className="inv-card-value">{collectionRate}%</span>
              <span className="inv-card-sub">Receipts/Billing Ratio</span>
            </div>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="reports-grid">
            {/* Timeline Area Chart */}
            <div className="report-chart-card large-chart">
              <h3>Sales vs Collections Timeline</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${settings.currency}${value.toLocaleString()}`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Sales"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Payments"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorPayments)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            <div className="report-chart-card small-chart">
              <h3>Invoice Status Distribution</h3>
              <div className="chart-pie-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {statusData.map((item, idx) => (
                  <div key={item.name} className="legend-item">
                    <span className="dot" style={{ background: COLORS[idx] }}></span>
                    <span className="name">{item.name}</span>
                    <span className="val">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          advancedReportsAllowed ? (
            <div className="reports-grid single-col">
              {/* Sales By Customer Bar Chart */}
              <div className="report-chart-card">
                <h3>Sales Billings by Customer</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesByCustomerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${settings.currency}${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Billed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                      {salesByCustomerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={{ padding: "32px 16px" }}>
              <UpgradeGate
                isOpen={true}
                onClose={null}
                title="Advanced Reports Locked"
                description="Sales Analytics, customer breakdowns, and advanced charts are available on the Professional plan and above."
                currentPlan={planName || "Free"}
                requiredPlan="Professional"
                inline={true}
              />
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

export default Reports;