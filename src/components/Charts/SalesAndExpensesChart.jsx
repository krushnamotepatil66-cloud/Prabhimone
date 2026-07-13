import { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../DashboardHome/WidgetStyles.css";

function SalesAndExpensesChart() {
  const { invoices, expenses, settings } = useApp();
  const [timeframe, setTimeframe] = useState("year");

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Compute values
  const getChartData = () => {
    // Current year is 2026 based on initial data
    const targetYear = 2026;

    if (timeframe === "month") {
      // Show July 2026 split by weeks
      const weeks = [
        { name: "Week 1", sales: 0, expenses: 0 },
        { name: "Week 2", sales: 0, expenses: 0 },
        { name: "Week 3", sales: 0, expenses: 0 },
        { name: "Week 4", sales: 0, expenses: 0 },
      ];

      invoices.forEach((inv) => {
        const date = new Date(inv.date);
        if (date.getFullYear() === targetYear && date.getMonth() === 6) { // July
          const day = date.getDate();
          const wIndex = Math.min(Math.floor((day - 1) / 7), 3);
          weeks[wIndex].sales += parseAmount(inv.amount);
        }
      });

      expenses.forEach((exp) => {
        const date = new Date(exp.date);
        if (date.getFullYear() === targetYear && date.getMonth() === 6) { // July
          const day = date.getDate();
          const wIndex = Math.min(Math.floor((day - 1) / 7), 3);
          weeks[wIndex].expenses += Number(exp.amount) || 0;
        }
      });

      return weeks;
    } else if (timeframe === "quarter") {
      // Show Q3 (Jul, Aug, Sep)
      const q3Months = [
        { name: "Jul", sales: 0, expenses: 0, index: 6 },
        { name: "Aug", sales: 0, expenses: 0, index: 7 },
        { name: "Sep", sales: 0, expenses: 0, index: 8 },
      ];

      q3Months.forEach((m) => {
        m.sales = invoices
          .filter((inv) => {
            const date = new Date(inv.date);
            return date.getFullYear() === targetYear && date.getMonth() === m.index;
          })
          .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

        m.expenses = expenses
          .filter((exp) => {
            const date = new Date(exp.date);
            return date.getFullYear() === targetYear && date.getMonth() === m.index;
          })
          .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      });

      return q3Months.map(({ name, sales, expenses }) => ({ name, sales, expenses }));
    } else {
      // Fiscal Year: Show Jan to Dec
      return months.map((monthName, index) => {
        const sales = invoices
          .filter((inv) => {
            const date = new Date(inv.date);
            return date.getFullYear() === targetYear && date.getMonth() === index;
          })
          .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);

        const expTotal = expenses
          .filter((exp) => {
            const date = new Date(exp.date);
            return date.getFullYear() === targetYear && date.getMonth() === index;
          })
          .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

        return {
          name: monthName,
          sales,
          expenses: expTotal,
        };
      }).slice(0, 8); // Slice to August for clean presentation
    }
  };

  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          padding: "10px 14px",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 6px 0", fontSize: "14px" }}>{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{
              color: entry.color,
              fontSize: "13px",
              fontWeight: 500,
              margin: "2px 0"
            }}>
              {entry.name}: {settings.currency || "₹"}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="zoho-card">
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Sales and Expenses</h4>
        <select
          className="zoho-card-select"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="year">This Fiscal Year</option>
          <option value="quarter">This Quarter</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 13 }} />
            <Bar name="Sales" dataKey="sales" fill="#1b75bb" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar name="Expenses" dataKey="expenses" fill="#ea4335" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesAndExpensesChart;
