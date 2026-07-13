import { useApp } from "../../context/AppContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Charts.css";

function PaymentChart() {
  const { invoices } = useApp();

  // Count invoices by status
  const statusCounts = { Paid: 0, Pending: 0, Overdue: 0 };
  invoices.forEach((inv) => {
    if (statusCounts[inv.status] !== undefined) {
      statusCounts[inv.status]++;
    }
  });

  const chartData = [
    { name: "Paid", value: statusCounts.Paid },
    { name: "Pending", value: statusCounts.Pending },
    { name: "Overdue", value: statusCounts.Overdue },
  ];

  const colors = ["#22c55e", "#f59e0b", "#ef4444"];

  // Avoid crash/rendering issues if no invoices exist yet
  const totalInvoices = invoices.length;
  const renderData = totalInvoices === 0 
    ? [{ name: "No Invoices", value: 1 }] 
    : chartData.filter(d => d.value > 0);

  const renderColors = totalInvoices === 0 ? ["#cbd5e1"] : colors.filter((_, idx) => chartData[idx].value > 0);

  return (
    <div className="chart-card">
      <h3>Payment Status</h3>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={renderData}
            dataKey="value"
            outerRadius={90}
            label
          >
            {renderData.map((_, index) => (
              <Cell
                key={index}
                fill={renderColors[index]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PaymentChart;