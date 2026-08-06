import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./RecordPaymentForm.css";

const emptyForm = {
  customerName: "",
  invoiceId: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  method: "Bank Transfer",
  reference: "",
  notes: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  chequeNumber: "",
  chequeDate: "",
  upiId: "",
  cardLastFour: "",
};

function RecordPaymentForm({ initialInvoice, onSave, onCancel }) {
  const { customers, invoices, settings } = useApp();
  const [form, setForm] = useState({ ...emptyForm });
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [savedPayment, setSavedPayment] = useState(null);

  const currency = settings?.currency || "₹";

  // Payment mode options from settings
  const paymentModes = settings?.paymentModes
    ? settings.paymentModes.split(",").map((m) => m.trim()).filter(Boolean)
    : ["Bank Transfer", "Cash", "UPI", "Credit Card", "Debit Card", "Cheque"];

  // Filter customers to only those with pending/overdue invoices
  const billingCustomers = customers.filter((cust) =>
    invoices.some((inv) => inv.customer === cust.name && inv.status !== "Paid")
  );

  // Auto prefill if initialInvoice is provided
  useEffect(() => {
    if (initialInvoice) {
      const numAmount = Number(String(initialInvoice.amount).replace(/[^0-9.-]/g, "")) || 0;
      setForm((prev) => ({
        ...prev,
        customerName: initialInvoice.customer,
        invoiceId: initialInvoice.id,
        amount: numAmount,
        date: new Date().toISOString().split("T")[0],
        method: settings?.paymentDefaultMethod || "Bank Transfer",
        reference: "",
        notes: `Payment for Invoice ${initialInvoice.id}`,
      }));
    } else {
      setForm({
        ...emptyForm,
        date: new Date().toISOString().split("T")[0],
        method: settings?.paymentDefaultMethod || "Bank Transfer",
      });
    }
  }, [initialInvoice, settings?.paymentDefaultMethod]);

  // When customer is selected, filter their unpaid invoices
  useEffect(() => {
    if (form.customerName) {
      const unpaid = invoices.filter(
        (inv) => inv.customer === form.customerName && inv.status !== "Paid"
      );
      setPendingInvoices(unpaid);

      // Skip auto selecting first unpaid invoice if we populated from initialInvoice
      if (initialInvoice && form.invoiceId === initialInvoice.id) {
        return;
      }

      // Auto select the first unpaid invoice if available
      if (unpaid.length > 0) {
        const firstInv = unpaid[0];
        const numAmount = Number(String(firstInv.amount).replace(/[^0-9.-]/g, "")) || 0;
        setForm((prev) => ({
          ...prev,
          invoiceId: firstInv.id,
          amount: numAmount,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          invoiceId: "",
          amount: "",
        }));
      }
    } else {
      setPendingInvoices([]);
      setForm((prev) => ({
        ...prev,
        invoiceId: "",
        amount: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customerName, invoices]);

  // When invoice selection changes, auto-fill amount
  const handleInvoiceChange = (invoiceId) => {
    const selectedInv = pendingInvoices.find((i) => i.id === invoiceId);
    if (selectedInv) {
      const numAmount = Number(String(selectedInv.amount).replace(/[^0-9.-]/g, "")) || 0;
      setForm((prev) => ({
        ...prev,
        invoiceId,
        amount: numAmount,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        invoiceId,
        amount: "",
      }));
    }
  };

  const handleInput = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Get the selected invoice details
  const selectedInvoice = pendingInvoices.find((i) => i.id === form.invoiceId) ||
    (initialInvoice && form.invoiceId === initialInvoice.id ? initialInvoice : null);

  const invoiceAmount = selectedInvoice
    ? Number(String(selectedInvoice.amount).replace(/[^0-9.-]/g, "")) || 0
    : 0;

  const formAmount = Number(form.amount) || 0;
  const isPartialPayment = formAmount > 0 && invoiceAmount > 0 && formAmount < invoiceAmount;
  const overpayment = formAmount > 0 && invoiceAmount > 0 && formAmount > invoiceAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerName || !form.invoiceId || !form.amount || !form.date) {
      alert("Please fill in all required fields.");
      return;
    }

    const payment = {
      customerName: form.customerName,
      invoiceId: form.invoiceId,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
      // Method-specific fields
      ...(form.method === "Bank Transfer" && {
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
      }),
      ...(form.method === "Cheque" && {
        chequeNumber: form.chequeNumber,
        chequeDate: form.chequeDate,
        bankName: form.bankName,
      }),
      ...(form.method === "UPI" && { upiId: form.upiId }),
      ...((form.method === "Credit Card" || form.method === "Debit Card") && {
        cardLastFour: form.cardLastFour,
      }),
    };

    setSavedPayment(payment);
    setSubmitted(true);
    onSave(payment);
  };

  // ─── Success Screen ───────────────────────────────────────
  if (submitted && savedPayment) {
    return (
      <div className="zoho-payment-form-container">
        <div className="payment-success-screen">
          <div className="success-animation">
            <div className="success-checkmark">✓</div>
          </div>
          <h2 className="success-title">Payment Recorded Successfully!</h2>
          <p className="success-sub">The payment has been logged and the invoice status has been updated.</p>

          <div className="success-receipt-card">
            <div className="receipt-paid-banner">
              <span className="receipt-paid-label">Amount Paid</span>
              <span className="receipt-paid-amount">
                {currency}{Number(savedPayment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="receipt-detail-rows">
              <div className="receipt-row">
                <span>Customer</span><strong>{savedPayment.customerName}</strong>
              </div>
              <div className="receipt-row">
                <span>Invoice</span><strong>{savedPayment.invoiceId}</strong>
              </div>
              <div className="receipt-row">
                <span>Date</span><strong>{savedPayment.date}</strong>
              </div>
              <div className="receipt-row">
                <span>Method</span><strong>{savedPayment.method}</strong>
              </div>
              {savedPayment.reference && (
                <div className="receipt-row">
                  <span>Reference</span><strong>{savedPayment.reference}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="success-actions">
            <button className="success-btn-primary" onClick={onCancel}>
              Back to Payments
            </button>
            <button className="success-btn-secondary" onClick={() => {
              setSavedPayment(null);
              setSubmitted(false);
              setForm({
                ...emptyForm,
                date: new Date().toISOString().split("T")[0],
                method: settings?.paymentDefaultMethod || "Bank Transfer",
              });
            }}>
              Record Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────
  return (
    <div className="zoho-payment-form-container">
      {/* Header */}
      <div className="form-page-header">
        <div className="form-header-left">
          <button className="form-back-btn" onClick={onCancel} title="Go Back">
            ← Back
          </button>
          <div>
            <h2>Record Payment</h2>
            <p className="form-header-sub">Log a payment received from a customer against an invoice.</p>
          </div>
        </div>
        <button className="form-close-x" onClick={onCancel} title="Close">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="zoho-billing-form">
        {/* ── Step 1: Transaction Details ── */}
        <div className="form-section-card">
          <h3 className="section-card-title">
            <span className="section-step-badge">1</span>
            Transaction Details
          </h3>
          <div className="customer-fields-grid">
            {/* Customer Select */}
            <div className="form-field-group">
              <label className="required-label">Customer</label>
              <select
                value={form.customerName}
                onChange={(e) => handleInput("customerName", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="">Select Customer with Unpaid Balance...</option>
                {billingCustomers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                    {c.company ? ` (${c.company})` : ""}
                  </option>
                ))}
              </select>
              {customers.length > 0 && billingCustomers.length === 0 && (
                <span className="field-hint">All invoices for existing customers are paid.</span>
              )}
              {customers.length === 0 && (
                <span className="field-hint">No customers found. Add customers with invoices first.</span>
              )}
            </div>

            {/* Invoice Select */}
            {form.customerName && (
              <div className="form-field-group">
                <label className="required-label">Invoice</label>
                {pendingInvoices.length > 0 ? (
                  <select
                    value={form.invoiceId}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    required
                    className="form-input-control"
                  >
                    <option value="">Select Unpaid Invoice...</option>
                    {pendingInvoices.map((inv) => {
                      const amt = Number(String(inv.amount).replace(/[^0-9.-]/g, "")) || 0;
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.id} — {currency}{amt.toLocaleString("en-IN")} (Due: {inv.dueDate || inv.date})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="no-invoices-msg">
                    No unpaid invoices for {form.customerName}.
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            {form.customerName && form.invoiceId && (
              <div className="form-field-group">
                <label className="required-label">Amount Received ({currency})</label>
                <div className="amount-input-wrapper">
                  <span className="amount-currency-prefix">{currency}</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount === 0 ? "" : form.amount}
                    onChange={(e) => handleInput("amount", e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="form-input-control amount-input-with-prefix"
                  />
                </div>
                {invoiceAmount > 0 && (
                  <div className="amount-helpers">
                    <span className="amount-hint">Invoice total: {currency}{invoiceAmount.toLocaleString("en-IN")}</span>
                    <button
                      type="button"
                      className="fill-full-btn"
                      onClick={() => handleInput("amount", invoiceAmount)}
                    >
                      Full Amount
                    </button>
                  </div>
                )}
                {isPartialPayment && (
                  <div className="amount-warning partial">
                    ⚠️ Partial payment — {currency}{(invoiceAmount - formAmount).toLocaleString("en-IN")} will remain outstanding.
                  </div>
                )}
                {overpayment && (
                  <div className="amount-warning over">
                    ⚠️ Amount exceeds invoice total by {currency}{(formAmount - invoiceAmount).toLocaleString("en-IN")}.
                  </div>
                )}
              </div>
            )}

            {/* Payment Date */}
            <div className="form-field-group">
              <label className="required-label">Payment Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleInput("date", e.target.value)}
                required
                className="form-input-control"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {/* ── Step 2: Payment Mode ── */}
        <div className="form-section-card">
          <h3 className="section-card-title">
            <span className="section-step-badge">2</span>
            Payment Mode &amp; Reference
          </h3>
          <div className="customer-fields-grid">
            {/* Payment Method */}
            <div className="form-field-group">
              <label className="required-label">Payment Mode</label>
              <div className="payment-mode-grid">
                {paymentModes.map((mode) => {
                  const icons = {
                    "Bank Transfer": "🏦",
                    "Cash": "💵",
                    "UPI": "📱",
                    "Credit Card": "💳",
                    "Debit Card": "💳",
                    "Cheque": "📄",
                  };
                  return (
                    <button
                      key={mode}
                      type="button"
                      className={`payment-mode-btn ${form.method === mode ? "selected" : ""}`}
                      onClick={() => handleInput("method", mode)}
                    >
                      <span className="mode-icon">{icons[mode] || "💰"}</span>
                      <span className="mode-label">{mode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Number */}
            <div className="form-field-group">
              <label>Reference Number</label>
              <input
                type="text"
                placeholder={
                  form.method === "UPI" ? "e.g. UPI Txn ID: T2024..." :
                  form.method === "Cheque" ? "e.g. Cheque No. 001234" :
                  form.method === "Bank Transfer" ? "e.g. NEFT/IMPS Txn Ref" :
                  "e.g. TXN987234"
                }
                value={form.reference}
                onChange={(e) => handleInput("reference", e.target.value)}
                className="form-input-control"
              />
            </div>
          </div>

          {/* Method-specific fields */}
          {form.method === "Bank Transfer" && (
            <div className="method-specific-section">
              <div className="method-specific-title">Bank Transfer Details <span className="optional-badge">Optional</span></div>
              <div className="customer-fields-grid">
                <div className="form-field-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI..."
                    value={form.bankName}
                    onChange={(e) => handleInput("bankName", e.target.value)}
                    className="form-input-control"
                  />
                </div>
                <div className="form-field-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={form.ifscCode}
                    onChange={(e) => handleInput("ifscCode", e.target.value.toUpperCase())}
                    className="form-input-control"
                    maxLength={11}
                  />
                </div>
              </div>
            </div>
          )}

          {form.method === "Cheque" && (
            <div className="method-specific-section">
              <div className="method-specific-title">Cheque Details <span className="optional-badge">Optional</span></div>
              <div className="customer-fields-grid">
                <div className="form-field-group">
                  <label>Cheque Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 001234"
                    value={form.chequeNumber}
                    onChange={(e) => handleInput("chequeNumber", e.target.value)}
                    className="form-input-control"
                  />
                </div>
                <div className="form-field-group">
                  <label>Cheque Date</label>
                  <input
                    type="date"
                    value={form.chequeDate}
                    onChange={(e) => handleInput("chequeDate", e.target.value)}
                    className="form-input-control"
                  />
                </div>
                <div className="form-field-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI..."
                    value={form.bankName}
                    onChange={(e) => handleInput("bankName", e.target.value)}
                    className="form-input-control"
                  />
                </div>
              </div>
            </div>
          )}

          {form.method === "UPI" && (
            <div className="method-specific-section">
              <div className="method-specific-title">UPI Details <span className="optional-badge">Optional</span></div>
              <div className="customer-fields-grid">
                <div className="form-field-group">
                  <label>UPI ID / VPA</label>
                  <input
                    type="text"
                    placeholder="e.g. customer@upi, 9876543210@paytm"
                    value={form.upiId}
                    onChange={(e) => handleInput("upiId", e.target.value)}
                    className="form-input-control"
                  />
                </div>
              </div>
            </div>
          )}

          {(form.method === "Credit Card" || form.method === "Debit Card") && (
            <div className="method-specific-section">
              <div className="method-specific-title">Card Details <span className="optional-badge">Optional</span></div>
              <div className="customer-fields-grid">
                <div className="form-field-group">
                  <label>Last 4 Digits of Card</label>
                  <input
                    type="text"
                    placeholder="e.g. 4242"
                    value={form.cardLastFour}
                    onChange={(e) => handleInput("cardLastFour", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="form-input-control"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Step 3: Notes ── */}
        <div className="form-section-card">
          <h3 className="section-card-title">
            <span className="section-step-badge">3</span>
            Notes
          </h3>
          <div className="form-field-group">
            <label>Internal Notes / Remarks</label>
            <textarea
              placeholder="e.g. Received full amount via net banking. Customer requested physical receipt."
              value={form.notes}
              onChange={(e) => handleInput("notes", e.target.value)}
              rows={3}
              className="form-textarea-control"
            />
          </div>
        </div>

        {/* ── Summary Preview ── */}
        {form.customerName && form.invoiceId && form.amount && (
          <div className="payment-preview-card">
            <div className="preview-card-title">Payment Summary</div>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Customer</span>
                <span className="preview-value">{form.customerName}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Invoice</span>
                <span className="preview-value" style={{ color: "#1b75bb" }}>{form.invoiceId}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Amount</span>
                <span className="preview-value amount-preview">{currency}{Number(form.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Method</span>
                <span className="preview-value">{form.method}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Date</span>
                <span className="preview-value">{form.date}</span>
              </div>
              {form.reference && (
                <div className="preview-item">
                  <span className="preview-label">Reference</span>
                  <span className="preview-value">{form.reference}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Footer Actions */}
        <div className="customer-form-footer-actions">
          <button type="submit" className="action-footer-btn save-btn">
            ✓ Record Payment
          </button>
          <button type="button" className="action-footer-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecordPaymentForm;
