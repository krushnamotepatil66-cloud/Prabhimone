import { useApp } from "../../context/AppContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Charts.css";

function RevenueChart() {
  const { invoices } = useApp();

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Compute monthly revenue aggregations
  const chartData = months.map((monthName, index) => {
    const monthInvoices = invoices.filter((inv) => {
      const date = new Date(inv.date);
      return date.getMonth() === index && date.getFullYear() === 2026;
    });

    const total = monthInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
    return { month: monthName, revenue: total };
  });

  // Display only months from Jan to Jul for current view, or all
  const displayData = chartData.slice(0, 7); // Show Jan - Jul since today is in Jul 2026

  return (
    <div className="chart-card">
      <h3>Revenue Overview</h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;