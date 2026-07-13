import { useApp } from "../../context/AppContext";
import "./WidgetStyles.css";

function TotalReceivables() {
  const { invoices, settings } = useApp();

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  // Filter invoices to get current (Pending) and overdue (Overdue)
  const currentInvoices = invoices.filter((inv) => inv.status === "Pending");
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue");

  const totalCurrent = currentInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  const totalReceivables = totalCurrent + totalOverdue;

  // Calculate percentages for the visual segment bar
  const total = totalReceivables || 1; // Avoid divide by zero
  const currentPercent = (totalCurrent / total) * 100;
  const overduePercent = (totalOverdue / total) * 100;

  const formatCurrency = (amount) => {
    return `${settings.currency || "₹"}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="zoho-card">
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Total Receivables</h4>
      </div>

      <div className="receivables-amount">
        {formatCurrency(totalReceivables)}
      </div>

      <div className="receivables-bar-container">
        {totalReceivables > 0 ? (
          <>
            <div
              className="receivables-bar-current"
              style={{ width: `${currentPercent}%` }}
              title={`Current: ${currentPercent.toFixed(1)}%`}
            />
            <div
              className="receivables-bar-overdue"
              style={{ width: `${overduePercent}%` }}
              title={`Overdue: ${overduePercent.toFixed(1)}%`}
            />
          </>
        ) : (
          <div
            className="receivables-bar-current"
            style={{ width: "100%", background: "#cbd5e1" }}
            title="No outstanding receivables"
          />
        )}
      </div>

      <div className="receivables-breakdown">
        <div className="breakdown-item">
          <div className="breakdown-label current">Current</div>
          <div className="breakdown-val">{formatCurrency(totalCurrent)}</div>
        </div>
        <div className="breakdown-item">
          <div className="breakdown-label overdue">Overdue</div>
          <div className="breakdown-val">{formatCurrency(totalOverdue)}</div>
        </div>
      </div>
    </div>
  );
}

export default TotalReceivables;
