import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./RecordPaymentForm.css";

const emptyForm = {
  customerName: "",
  invoiceId: "",
  amount: "",
  date: "",
  method: "Bank Transfer",
  reference: "",
  notes: "",
};

function RecordPaymentForm({ initialInvoice, onSave, onCancel }) {
  const { customers, invoices, settings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [pendingInvoices, setPendingInvoices] = useState([]);

  // Filter customers to only those with pending/overdue invoices
  const billingCustomers = customers.filter((cust) =>
    invoices.some((inv) => inv.customer === cust.name && inv.status !== "Paid")
  );

  // Auto prefill if initialInvoice is provided
  useEffect(() => {
    if (initialInvoice) {
      const numAmount = Number(String(initialInvoice.amount).replace(/[^0-9.-]/g, "")) || 0;
      setForm({
        customerName: initialInvoice.customer,
        invoiceId: initialInvoice.id,
        amount: numAmount,
        date: new Date().toISOString().split("T")[0],
        method: "Bank Transfer",
        reference: "",
        notes: `Payment for Invoice ${initialInvoice.id}`,
      });
    } else {
      setForm({
        ...emptyForm,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialInvoice]);

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

    onSave({
      customerName: form.customerName,
      invoiceId: form.invoiceId,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
    });
  };

  return (
    <div className="zoho-payment-form-container">
      {/* Header */}
      <div className="form-page-header">
        <h2>Record Payment</h2>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="zoho-billing-form">
        {/* Core Transaction Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Transaction Details</h3>
          <div className="customer-fields-grid">
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
                  </option>
                ))}
              </select>
            </div>

            {form.customerName && (
              <>
                <div className="form-field-group">
                  <label className="required-label">Invoice</label>
                  <select
                    value={form.invoiceId}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    required
                    className="form-input-control"
                  >
                    <option value="">Select Unpaid Invoice...</option>
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.amount} (Due: {inv.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="required-label">Amount Received ({settings.currency})</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount === 0 ? "" : form.amount}
                    onChange={(e) => handleInput("amount", e.target.value)}
                    required
                    min="1"
                    className="form-input-control"
                  />
                </div>
              </>
            )}

            <div className="form-field-group">
              <label className="required-label">Payment Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleInput("date", e.target.value)}
                required
                className="form-input-control"
              />
            </div>
          </div>
        </div>

        {/* Method & References Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Payment Mode & Reference</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label className="required-label">Payment Mode</label>
              <select
                value={form.method}
                onChange={(e) => handleInput("method", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="form-field-group">
              <label>Reference Number</label>
              <input
                type="text"
                placeholder="e.g. TXN987234, Cheque No"
                value={form.reference}
                onChange={(e) => handleInput("reference", e.target.value)}
                className="form-input-control"
              />
            </div>
          </div>
        </div>

        {/* Remarks / Notes Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Notes</h3>
          <div className="form-field-group">
            <label>Notes / Remarks</label>
            <textarea
              placeholder="e.g. Received full amount via net banking"
              value={form.notes}
              onChange={(e) => handleInput("notes", e.target.value)}
              rows={4}
              className="form-textarea-control"
            />
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="customer-form-footer-actions">
          <button type="submit" className="action-footer-btn save-btn">
            Record Payment
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
