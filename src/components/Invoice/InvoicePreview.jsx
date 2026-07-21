import { useApp } from "../../context/AppContext";
import generateInvoicePDF from "../../utils/generateInvoicePDF";
import "./InvoicePreview.css";

function InvoicePreview({ invoice, onClose, onEdit, onDelete, onRecordPayment }) {
  const { settings } = useApp();
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    generateInvoicePDF(invoice);
  };

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  // Calculate totals from items
  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [{ product: "Invoice Amount", qty: 1, price: parseAmount(invoice.amount) }];

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxRate = settings.taxRate || 18;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const formatVal = (val) => {
    return `${settings.currency || "₹"}${val.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="zoho-preview-pane">
      {/* Action Toolbar */}
      <div className="zoho-preview-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn close-btn" onClick={onClose} title="Close Preview">
            ◀ Back to List
          </button>
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn edit-btn" onClick={() => onEdit(invoice)}>
            ✏️ Edit
          </button>

          {invoice.status !== "Paid" && onRecordPayment && (
            <button className="toolbar-btn payment-btn" onClick={() => onRecordPayment(invoice)}>
              💵 Record Payment
            </button>
          )}

          <button className="toolbar-btn" onClick={handleDownload}>
            📄 PDF
          </button>

          <button className="toolbar-btn" onClick={handlePrint}>
            🖨️ Print
          </button>

          <button className="toolbar-btn delete-btn" onClick={() => onDelete(invoice.id)}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Transaction status alert */}
      <div className={`status-timeline-banner ${invoice.status.toLowerCase()}`}>
        <span className="banner-badge-dot" />
        <strong>Invoice {invoice.id}</strong> is <strong>{invoice.status}</strong>. 
        {invoice.status !== "Paid" && ` Balance due: ${formatVal(invoice.status === "Paid" ? 0 : parseAmount(invoice.amount))}`}
      </div>

      {/* Embedded Paper Document Sheet */}
      <div className="paper-document-scroll-container">
        <div className="invoice-paper-sheet">
          <div className="paper-header">
            <div className="org-details">
              <h2 className="org-name">{settings.companyName || "PrabhimOne India"}</h2>
              <p className="org-sub">{settings.address || "123, Business Hub"}</p>
              <p className="org-sub">{settings.city || "Mumbai, Maharashtra"}</p>
              <p className="org-sub">GSTIN: 27AAAAA1111A1Z1</p>
            </div>

            <div className="doc-type-title">
              <h1>INVOICE</h1>
              <div className="invoice-meta-grid">
                <div className="meta-label">Invoice No:</div>
                <div className="meta-value bold-text">{invoice.id}</div>
                <div className="meta-label">Date:</div>
                <div className="meta-value">{invoice.date}</div>
                <div className="meta-label">Due Date:</div>
                <div className="meta-value">{invoice.date}</div>
              </div>
            </div>
          </div>

          <hr className="paper-divider" />

          <div className="bill-to-section">
            <div className="bill-to-col">
              <h4 className="bill-label">Bill To:</h4>
              <p className="bill-customer-name">{invoice.customer}</p>
              <p className="bill-customer-sub">Client details registered in database</p>
            </div>
          </div>

          <table className="paper-items-table">
            <thead>
              <tr>
                <th width="40">#</th>
                <th>Item Details</th>
                <th style={{ textAlign: "right" }} width="80">Qty</th>
                <th style={{ textAlign: "right" }} width="120">Rate</th>
                <th style={{ textAlign: "right" }} width="120">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td data-label="Item No">{idx + 1}</td>
                  <td className="item-name-cell">{item.product || "Standard Service"}</td>
                  <td style={{ textAlign: "right" }} data-label="Qty">{item.qty}</td>
                  <td style={{ textAlign: "right" }} data-label="Rate">{formatVal(item.price)}</td>
                  <td style={{ textAlign: "right" }} data-label="Amount">{formatVal(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paper-summary-section">
            <div className="summary-col-left">
              <p className="payment-terms-text">
                Thank you for your business. Please remit payments promptly.
              </p>
            </div>

            <div className="summary-col-right">
              <div className="summary-meta-grid">
                <div className="summary-label">Sub Total:</div>
                <div className="summary-val">{formatVal(subtotal)}</div>
                
                <div className="summary-label">GST ({taxRate}%):</div>
                <div className="summary-val">{formatVal(taxAmount)}</div>

                <hr className="grid-divider" />
                <hr className="grid-divider" />

                <div className="summary-label grand-total-label">Grand Total:</div>
                <div className="summary-val grand-total-val">{formatVal(totalAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;