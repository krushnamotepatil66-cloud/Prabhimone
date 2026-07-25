import { useApp } from "../../context/AppContext";
import generateInvoicePDF from "../../utils/generateInvoicePDF";
import { numberToWords } from "../../utils/numberToWords";
import "./InvoicePreview.css";

function InvoicePreview({ invoice, onClose, onEdit, onDelete, onRecordPayment }) {
  const { settings, profile } = useApp();
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    await generateInvoicePDF(invoice, settings);
  };

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  // Calculate totals from items
  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [{ product: "Invoice Amount", qty: 1, price: parseAmount(invoice.amount) }];

  // Math Calculations for Preview
  const calculateItemDiscount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const discVal = Number(item.discount) || 0;
    if (item.discountType === "%" || item.discountType === "Percentage") {
      return (itemSub * discVal) / 100;
    }
    return discVal;
  };

  const calculateItemTaxableAmount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const disc = calculateItemDiscount(item);
    return Math.max(0, itemSub - disc);
  };

  const calculateItemTaxAmount = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxRate = Number(item.tax) || 0;
    return (taxable * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxAmt = calculateItemTaxAmount(item);
    return taxable + taxAmt;
  };

  let subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  let totalItemDiscount = items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  let totalTaxableAmount = items.reduce((sum, item) => sum + calculateItemTaxableAmount(item), 0);
  let totalTax = items.reduce((sum, item) => sum + calculateItemTaxAmount(item), 0);

  // In the preview, we can either use invoice global values or compute them.
  // The form calculates grandTotal using additionalCharges and autoRoundOff.
  const charges = Number(invoice.additionalCharges) || 0;
  const tempGrandTotal = totalTaxableAmount + totalTax + charges;
  const roundedGrandTotal = Math.round(tempGrandTotal);
  let roundOffDifference = invoice.autoRoundOff ? Number((roundedGrandTotal - tempGrandTotal).toFixed(2)) : 0;
  let totalAmount = invoice.autoRoundOff ? roundedGrandTotal : tempGrandTotal;

  const totalAmountInWords = numberToWords(Math.round(totalAmount));

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
          <div className="tax-invoice-title-wrapper">
            <h1 className="tax-invoice-title">Tax Invoice</h1>
          </div>
          
          <div className="paper-header">
            <div className="org-details">
              <h2 className="org-name">{settings.companyName || "Prabhim Technologies (OPC) Pvt. Ltd."}</h2>
              <p className="org-sub">{settings.address || "FL-1002 A, Utsav Residency Phase 1, Awhalwadi Road,"}</p>
              <p className="org-sub">{settings.city || "Wagholi, Pune, 412202, India"}</p>
              <p className="org-sub">Phone : {settings.phone || "+91-9403301412"}</p>
              <p className="org-sub">e-mail : {settings.email || "info@prabhimtechnologies.in"}</p>
              <p className="org-sub">GSTN: {settings.gstin || "27AAPCP6019G1Z5"}</p>
              <p className="org-sub">State: {settings.state || "Maharashtra"}</p>
            </div>
            <div className="org-logo-placeholder">
              {settings.companyLogo ? (
                <img src={settings.companyLogo} alt="Company Logo" className="company-logo" />
              ) : (
                <div style={{ width: "120px", height: "60px", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", borderRadius: "4px", float: "right" }}>Company Logo</div>
              )}
            </div>
          </div>

          <div className="invoice-info-split">
            <div className="bill-to-section">
              <h4 className="box-title">Bill To</h4>
              <p className="bill-customer-name">{invoice.customer}</p>
              <p className="bill-customer-sub">Client details registered in database</p>
              <p className="bill-customer-sub">Contact No</p>
              <p className="bill-customer-sub">GSTN: XXXXXXXX</p>
              <p className="bill-customer-sub">State : Maharashtra</p>
            </div>

            <div className="invoice-details-section">
              <h4 className="box-title">Invoice Details</h4>
              <div className="invoice-meta-grid">
                <div className="meta-label">Invoice No.:</div>
                <div className="meta-value bold-text">{invoice.id}</div>
                <div className="meta-label">PO No:</div>
                <div className="meta-value">-</div>
                <div className="meta-label">Date:</div>
                <div className="meta-value">{invoice.date}</div>
              </div>
            </div>
          </div>

          <table className="paper-items-table new-design-table">
            <thead>
              <tr>
                <th width="40">#</th>
                <th>Item Details</th>
                <th width="80">HSN/SAC</th>
                <th style={{ textAlign: "right" }} width="60">Qty</th>
                <th style={{ textAlign: "right" }} width="60">Unit</th>
                <th style={{ textAlign: "right" }} width="80">Rate</th>
                <th style={{ textAlign: "right" }} width="80">Disc.</th>
                <th style={{ textAlign: "right" }} width="60">GST %</th>
                <th style={{ textAlign: "right" }} width="100">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td data-label="#">{idx + 1}</td>
                  <td className="item-name-cell" data-label="Item Details">
                    <div style={{ fontWeight: 600 }}>{item.product || "Standard Service"}</div>
                    {item.description && <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{item.description}</div>}
                  </td>
                  <td data-label="HSN/SAC">{item.hsn || "-"}</td>
                  <td style={{ textAlign: "right" }} data-label="Qty">{item.qty || "0"}</td>
                  <td style={{ textAlign: "right" }} data-label="Unit">{item.unit || "-"}</td>
                  <td style={{ textAlign: "right" }} data-label="Rate">{formatVal(item.price)}</td>
                  <td style={{ textAlign: "right" }} data-label="Disc.">{item.discount ? `${item.discount}${item.discountType === "%" ? "%" : " flat"}` : "-"}</td>
                  <td style={{ textAlign: "right" }} data-label="GST %">{item.tax ? `${item.tax}%` : "-"}</td>
                  <td style={{ textAlign: "right" }} data-label="Amount">{formatVal(calculateItemTaxableAmount(item))}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan="3" className="text-right fw-bold">Total</td>
                <td style={{ textAlign: "right" }} className="fw-bold">{items.reduce((sum, item) => sum + Number(item.qty || 0), 0)}</td>
                <td colSpan="4"></td>
                <td style={{ textAlign: "right" }} className="fw-bold">{formatVal(totalTaxableAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div className="paper-summary-section">
            <div className="summary-col-left">
              <p className="desc-title">Description</p>
              <br/>
              <p className="desc-title">Invoice Amount In Words</p>
              <p className="amount-in-words">{totalAmountInWords}</p>
            </div>

            <div className="summary-col-right">
              <div className="summary-meta-grid">
                <div className="summary-label">Sub Total:</div>
                <div className="summary-val">{formatVal(subtotal)}</div>
                
                {totalItemDiscount > 0 && (
                  <>
                    <div className="summary-label">Discount:</div>
                    <div className="summary-val">-{formatVal(totalItemDiscount)}</div>
                  </>
                )}
                
                <div className="summary-label">Taxable Amount:</div>
                <div className="summary-val">{formatVal(totalTaxableAmount)}</div>

                {totalTax > 0 && (
                  <>
                    <div className="summary-label">SGST:</div>
                    <div className="summary-val">{formatVal(totalTax / 2)}</div>
                    
                    <div className="summary-label">CGST:</div>
                    <div className="summary-val">{formatVal(totalTax / 2)}</div>
                  </>
                )}

                {charges > 0 && (
                  <>
                    <div className="summary-label">Shipping / Additional:</div>
                    <div className="summary-val">{formatVal(charges)}</div>
                  </>
                )}

                {roundOffDifference !== 0 && (
                  <>
                    <div className="summary-label">Round Off:</div>
                    <div className="summary-val">{roundOffDifference > 0 ? "+" : ""}{roundOffDifference}</div>
                  </>
                )}
              </div>
              <div className="final-total-box">
                <div className="final-total-label">Total:</div>
                <div className="final-total-value">{formatVal(totalAmount)}</div>
              </div>
              
              {invoice.status === "Paid" && (
                <div className="summary-meta-grid" style={{ marginTop: "12px", marginBottom: 0 }}>
                  <div className="summary-label">Amount Paid:</div>
                  <div className="summary-val">{formatVal(totalAmount)}</div>
                  <div className="summary-label">Balance Due:</div>
                  <div className="summary-val">{formatVal(0)}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="paper-footer">
            <div className="footer-left" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {invoice.status === "Paid" && (
                <img src="/paid-stamp.png" alt="Paid Stamp" style={{ width: "120px", marginBottom: "10px", opacity: 0.85, mixBlendMode: "multiply" }} />
              )}
              <p>Thanks for doing business with us!</p>
            </div>
            <div className="footer-right">
              <p className="auth-signatory-name" style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px", marginTop: "2.5rem" }}>{profile?.name || "Business Owner"}</p>
              <p className="auth-signatory-title">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;