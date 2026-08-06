import { useRef } from "react";
import { useApp } from "../../context/AppContext";
import "./PaymentDetailModal.css";

function PaymentDetailModal({ payment, onClose }) {
  const { settings } = useApp();
  const receiptRef = useRef(null);

  if (!payment) return null;

  const currency = settings?.currency || "₹";

  const methodIcons = {
    "Bank Transfer": "🏦",
    "Cash": "💵",
    "UPI": "📱",
    "Credit Card": "💳",
    "Debit Card": "💳",
    "Cheque": "📄",
  };

  const methodColors = {
    "Bank Transfer": "#3b82f6",
    "Cash": "#10b981",
    "UPI": "#8b5cf6",
    "Credit Card": "#f59e0b",
    "Debit Card": "#f59e0b",
    "Cheque": "#64748b",
  };

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #1e293b; }
            .receipt-print { padding: 40px; max-width: 600px; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .receipt-header h1 { font-size: 28px; color: #1b75bb; margin-bottom: 4px; }
            .receipt-header p { color: #64748b; font-size: 14px; }
            .receipt-stamp { display: inline-block; border: 3px solid #10b981; color: #10b981; padding: 6px 20px; border-radius: 4px; font-size: 18px; font-weight: 700; letter-spacing: 2px; margin: 12px 0; transform: rotate(-5deg); }
            .receipt-amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .receipt-amount-box .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .receipt-amount-box .amount { font-size: 36px; font-weight: 800; color: #059669; margin: 4px 0; }
            .receipt-details table { width: 100%; border-collapse: collapse; }
            .receipt-details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .receipt-details td:first-child { color: #64748b; width: 40%; }
            .receipt-details td:last-child { font-weight: 600; color: #1e293b; }
            .receipt-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 16px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="receipt-print">
            <div class="receipt-header">
              <h1>Payment Receipt</h1>
              <p>Official receipt for payment received</p>
              <div class="receipt-stamp">PAID</div>
            </div>
            <div class="receipt-amount-box">
              <div class="label">Amount Received</div>
              <div class="amount">${currency}${Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div style="color:#64748b;font-size:13px">on ${payment.date}</div>
            </div>
            <div class="receipt-details">
              <table>
                <tr><td>Receipt No.</td><td>${payment.id}</td></tr>
                <tr><td>Invoice No.</td><td>${payment.invoiceId}</td></tr>
                <tr><td>Customer</td><td>${payment.customerName}</td></tr>
                <tr><td>Payment Method</td><td>${payment.method}</td></tr>
                ${payment.reference ? `<tr><td>Reference No.</td><td>${payment.reference}</td></tr>` : ""}
                ${payment.notes ? `<tr><td>Notes</td><td>${payment.notes}</td></tr>` : ""}
              </table>
            </div>
            <div class="receipt-footer">
              <p>Thank you for your payment. This is a computer generated receipt.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const methodColor = methodColors[payment.method] || "#64748b";
  const methodIcon = methodIcons[payment.method] || "💰";

  return (
    <div className="pdm-overlay" onClick={onClose}>
      <div className="pdm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pdm-header">
          <div className="pdm-header-left">
            <div className="pdm-receipt-icon">🧾</div>
            <div>
              <h2 className="pdm-title">Payment Receipt</h2>
              <span className="pdm-id">{payment.id}</span>
            </div>
          </div>
          <div className="pdm-header-actions">
            <button className="pdm-print-btn" onClick={handlePrint}>
              🖨️ Print Receipt
            </button>
            <button className="pdm-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="pdm-body" ref={receiptRef}>
          {/* PAID Stamp Area */}
          <div className="pdm-paid-banner">
            <div className="pdm-paid-left">
              <div className="pdm-paid-label">Amount Received</div>
              <div className="pdm-paid-amount">
                {currency}{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="pdm-paid-date">on {payment.date}</div>
            </div>
            <div className="pdm-paid-stamp">PAID</div>
          </div>

          {/* Method Badge */}
          <div className="pdm-method-row">
            <span className="pdm-method-badge" style={{ backgroundColor: methodColor + "18", color: methodColor, borderColor: methodColor + "40" }}>
              {methodIcon} {payment.method}
            </span>
          </div>

          {/* Details Grid */}
          <div className="pdm-details-grid">
            <div className="pdm-detail-item">
              <span className="pdm-detail-label">Receipt Number</span>
              <span className="pdm-detail-value">{payment.id}</span>
            </div>
            <div className="pdm-detail-item">
              <span className="pdm-detail-label">Invoice Number</span>
              <span className="pdm-detail-value" style={{ color: "#1b75bb", fontWeight: 700 }}>{payment.invoiceId}</span>
            </div>
            <div className="pdm-detail-item">
              <span className="pdm-detail-label">Customer</span>
              <span className="pdm-detail-value">{payment.customerName}</span>
            </div>
            <div className="pdm-detail-item">
              <span className="pdm-detail-label">Payment Date</span>
              <span className="pdm-detail-value">{payment.date}</span>
            </div>
            <div className="pdm-detail-item">
              <span className="pdm-detail-label">Payment Mode</span>
              <span className="pdm-detail-value">{payment.method}</span>
            </div>
            {payment.reference && (
              <div className="pdm-detail-item">
                <span className="pdm-detail-label">Reference Number</span>
                <span className="pdm-detail-value pdm-ref">{payment.reference}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="pdm-notes-section">
              <div className="pdm-notes-label">Notes</div>
              <div className="pdm-notes-text">{payment.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div className="pdm-receipt-footer">
            <p>Thank you for your payment. This is a computer generated receipt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailModal;
