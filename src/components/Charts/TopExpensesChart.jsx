import { useApp } from "../../context/AppContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../DashboardHome/WidgetStyles.css";

function TopExpensesChart() {
  const { expenses, settings } = useApp();

  // Aggregate expenses by category
  const categoriesMap = {};
  let grandTotal = 0;

  expenses.forEach((exp) => {
    const amt = Number(exp.amount) || 0;
    categoriesMap[exp.category] = (categoriesMap[exp.category] || 0) + amt;
    grandTotal += amt;
  });

  const sortedCategories = Object.entries(categoriesMap)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Set colors for the pie pieces
  const COLORS = ["#1b75bb", "#10b981", "#fb8c00", "#ec4899", "#8b5cf6", "#64748b"];

  const renderData = sortedCategories.length > 0
    ? sortedCategories
    : [{ name: "No Expenses", value: 1, percent: 100 }];

  const renderColors = sortedCategories.length > 0
    ? COLORS.slice(0, sortedCategories.length)
    : ["#cbd5e1"];

  const formatCurrency = (amount) => {
    return `${settings.currency || "₹"}${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0
    })}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontWeight: 600, color: "#1e293b", margin: 0, fontSize: "13px" }}>{data.name}</p>
          <p style={{ color: "#2563eb", fontSize: "12px", fontWeight: 500, margin: "2px 0 0 0" }}>
            {formatCurrency(data.value)} ({data.percent.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="zoho-card">
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Top Expenses</h4>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center", flex: 1, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 120px", height: 160, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={renderData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {renderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={renderColors[index % renderColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none"
          }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Total</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>{formatCurrency(grandTotal)}</div>
          </div>
        </div>

        <div style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {sortedCategories.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "70%" }}>
                <span style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: COLORS[idx % COLORS.length]
                }} />
                <span style={{
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }} title={cat.name}>
                  {cat.name}
                </span>
              </div>
              <span style={{ fontWeight: 600, color: "#1e293b", textAlign: "right" }}>
                {formatCurrency(cat.value)}
              </span>
            </div>
          ))}
          {sortedCategories.length === 0 && (
            <div style={{ color: "#94a3b8", textAlign: "center", fontSize: "13px" }}>
              No expenses registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopExpensesChart;
