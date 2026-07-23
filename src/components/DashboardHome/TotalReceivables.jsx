import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./WidgetStyles.css";

function TotalReceivables() {
  const { invoices, settings } = useApp();
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  const getInvoiceAmount = (inv) => {
    if (typeof inv.grandTotal === "number" && inv.grandTotal > 0) {
      return inv.grandTotal;
    }
    if (Array.isArray(inv.items) && inv.items.length > 0) {
      let totalTaxable = 0;
      let totalTax = 0;

      inv.items.forEach((item) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        const itemSub = qty * price;

        const discVal = Number(item.discount) || 0;
        const disc = item.discountType === "%" ? (itemSub * discVal) / 100 : discVal;
        const taxable = Math.max(0, itemSub - disc);

        const taxRate = Number(item.tax) || 0;
        const tax = (taxable * taxRate) / 100;

        totalTaxable += taxable;
        totalTax += tax;
      });

      const charges = Number(inv.additionalCharges) || 0;
      const tempTotal = totalTaxable + totalTax + charges;
      const rounded = Math.round(tempTotal);
      const finalVal = inv.autoRoundOff ? rounded : tempTotal;

      if (finalVal > 0) return finalVal;
    }
    if (typeof inv.amount === "number") return inv.amount;
    return parseAmount(inv.amount);
  };

  const today = new Date();
  let totalCurrent = 0;
  let overdue1_15 = 0;
  let overdue16_30 = 0;
  let overdue31_45 = 0;
  let overdue45plus = 0;

  invoices.forEach((inv) => {
    if (inv.status === "Paid") return;
    const amount = getInvoiceAmount(inv);

    if (inv.status === "Pending") {
      totalCurrent += amount;
    } else if (inv.status === "Overdue") {
      const dDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
      const diffTime = today - dDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        overdue1_15 += amount;
      } else if (diffDays <= 30) {
        overdue16_30 += amount;
      } else if (diffDays <= 45) {
        overdue31_45 += amount;
      } else {
        overdue45plus += amount;
      }
    }
  });

  const totalOverdue = overdue1_15 + overdue16_30 + overdue31_45 + overdue45plus;
  const totalReceivables = totalCurrent + totalOverdue;

  // Calculate percentages for the visual segment bar
  const total = totalReceivables || 1; // Avoid divide by zero
  const currentPercent = (totalCurrent / total) * 100;
  const overduePercent = (totalOverdue / total) * 100;

  const formatCurrency = (amount) => {
    return `${settings.currency || "₹"}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <div className="zoho-card">
      <div className="zoho-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 className="zoho-card-title">Total Receivables</h4>
        
        <div className="quick-add-container" style={{ position: "relative" }}>
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
              <div className="quick-add-dropdown" style={{ zIndex: 100, position: "absolute", right: 0, top: "100%", marginTop: "8px" }}>
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

      <div className="receivables-breakdown-wrapper">
        <div className="breakdown-current-section">
          <div className="breakdown-label current">CURRENT</div>
          <div className="breakdown-val">{formatCurrency(totalCurrent)}</div>
        </div>
        
        <div className="breakdown-overdue-section">
          <div className="breakdown-label overdue">OVERDUE</div>
          <div className="breakdown-overdue-grid">
            <div className="breakdown-item">
              <div className="breakdown-val">{formatCurrency(overdue1_15)}</div>
              <div className="breakdown-subtext">1-15 Days</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-val">{formatCurrency(overdue16_30)}</div>
              <div className="breakdown-subtext">16-30 Days</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-val">{formatCurrency(overdue31_45)}</div>
              <div className="breakdown-subtext">31-45 Days</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-val">{formatCurrency(overdue45plus)}</div>
              <div className="breakdown-subtext">Above 45 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalReceivables;
