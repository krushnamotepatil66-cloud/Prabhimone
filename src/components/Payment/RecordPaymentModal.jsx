import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./RecordPaymentModal.css";

const emptyForm = {
  customerName: "",
  invoiceId: "",
  amount: "",
  date: "",
  method: "Bank Transfer",
  reference: "",
  notes: "",
};

function RecordPaymentModal({ isOpen, onClose, initialInvoice }) {
  const { customers, invoices, addPayment, settings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const currency = settings?.currency || "₹";

  const paymentModes = settings?.paymentModes
    ? settings.paymentModes.split(",").map((m) => m.trim()).filter(Boolean)
    : ["Bank Transfer", "Cash", "UPI", "Credit Card", "Debit Card", "Cheque"];

  // Filter customers to only those with pending/overdue invoices
  const billingCustomers = customers.filter((cust) =>
    invoices.some(
      (inv) => inv.customer === cust.name && inv.status !== "Paid"
    )
  );

  // Auto prefill if initialInvoice is provided
  useEffect(() => {
    if (isOpen && initialInvoice) {
      const numAmount = Number(String(initialInvoice.amount).replace(/[^0-9.-]/g, "")) || 0;
      setForm({
        customerName: initialInvoice.customer,
        invoiceId: initialInvoice.id,
        amount: numAmount,
        date: new Date().toISOString().split("T")[0],
        method: settings?.paymentDefaultMethod || "Bank Transfer",
        reference: "",
        notes: `Payment for Invoice ${initialInvoice.id}`,
      });
    } else if (isOpen) {
      setForm({
        ...emptyForm,
        date: new Date().toISOString().split("T")[0],
        method: settings?.paymentDefaultMethod || "Bank Transfer",
      });
    }
  }, [isOpen, initialInvoice, settings?.paymentDefaultMethod]);

  // When customer is selected, filter their unpaid invoices
  useEffect(() => {
    if (form.customerName) {
      const unpaid = invoices.filter(
        (inv) => inv.customer === form.customerName && inv.status !== "Paid"
      );
      setPendingInvoices(unpaid);

      if (initialInvoice && form.invoiceId === initialInvoice.id) {
        return;
      }

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
  }, [form.customerName, invoices, initialInvoice]);

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

  if (!isOpen) return null;

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerName || !form.invoiceId || !form.amount || !form.date) {
      alert("Please fill in all required fields.");
      return;
    }

    addPayment({
      customerName: form.customerName,
      invoiceId: form.invoiceId,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
    });

    setForm(emptyForm);
    onClose();
  };

  const selectedInvoice = pendingInvoices.find((i) => i.id === form.invoiceId) ||
    (initialInvoice && form.invoiceId === initialInvoice.id ? initialInvoice : null);
  const invoiceAmount = selectedInvoice
    ? Number(String(selectedInvoice.amount).replace(/[^0-9.-]/g, "")) || 0 : 0;
  const formAmount = Number(form.amount) || 0;
  const isPartialPayment = formAmount > 0 && invoiceAmount > 0 && formAmount < invoiceAmount;

  const methodIcons = { "Bank Transfer": "🏦", "Cash": "💵", "UPI": "📱", "Credit Card": "💳", "Debit Card": "💳", "Cheque": "📄" };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Customer */}
          <div className="form-group">
            <label>Customer *</label>
            <select
              value={form.customerName}
              onChange={(e) => handleInput("customerName", e.target.value)}
              required
            >
              <option value="">Select Customer with Unpaid Balance...</option>
              {billingCustomers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}{c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice */}
          {form.customerName && (
            <div className="form-group">
              <label>Invoice *</label>
              <select
                value={form.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                required
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
            </div>
          )}

          {/* Amount */}
          {form.customerName && form.invoiceId && (
            <div className="form-group">
              <label>Amount Received ({currency}) *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount === 0 ? "" : form.amount}
                  onChange={(e) => handleInput("amount", e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                />
                {invoiceAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleInput("amount", invoiceAmount)}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "#1b75bb", color: "#fff", border: "none", borderRadius: 4,
                      padding: "2px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    Full
                  </button>
                )}
              </div>
              {invoiceAmount > 0 && (
                <small style={{ color: "#64748b", fontSize: 11 }}>
                  Invoice total: {currency}{invoiceAmount.toLocaleString("en-IN")}
                </small>
              )}
              {isPartialPayment && (
                <small style={{ color: "#92400e", background: "#fef3c7", padding: "4px 8px", borderRadius: 4, display: "block", marginTop: 4, fontSize: 11 }}>
                  ⚠️ Partial payment — {currency}{(invoiceAmount - formAmount).toLocaleString("en-IN")} remaining
                </small>
              )}
            </div>
          )}

          {/* Date */}
          <div className="form-group">
            <label>Payment Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleInput("date", e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Payment Mode */}
          <div className="form-group">
            <label>Payment Mode *</label>
            <div className="modal-mode-grid">
              {paymentModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`modal-mode-btn ${form.method === mode ? "selected" : ""}`}
                  onClick={() => handleInput("method", mode)}
                >
                  <span>{methodIcons[mode] || "💰"}</span>
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div className="form-group">
            <label>Reference Number</label>
            <input
              type="text"
              placeholder={
                form.method === "UPI" ? "UPI Txn ID..." :
                form.method === "Cheque" ? "Cheque No..." :
                "e.g. TXN987234"
              }
              value={form.reference}
              onChange={(e) => handleInput("reference", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes / Remarks</label>
            <textarea
              placeholder="e.g. Received full amount via net banking"
              value={form.notes}
              onChange={(e) => handleInput("notes", e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">✓ Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
