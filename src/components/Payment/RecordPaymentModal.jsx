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
        method: "Bank Transfer",
        reference: "",
        notes: `Payment for Invoice ${initialInvoice.id}`,
      });
    } else if (isOpen) {
      setForm(emptyForm);
    }
  }, [isOpen, initialInvoice]);

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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
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
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {form.customerName && (
            <>
              <div className="form-group">
                <label>Invoice *</label>
                <select
                  value={form.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                >
                  <option value="">Select Unpaid Invoice...</option>
                  {pendingInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} — {inv.amount} (Due: {inv.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount Received ({settings.currency}) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.amount === 0 ? "" : form.amount}
                  onChange={(e) => handleInput("amount", e.target.value)}
                  required
                  min="1"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Payment Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleInput("date", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Mode *</label>
            <select
              value={form.method}
              onChange={(e) => handleInput("method", e.target.value)}
              required
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reference Number (Txn ID, Cheque #, etc.)</label>
            <input
              type="text"
              placeholder="e.g. TXN987234"
              value={form.reference}
              onChange={(e) => handleInput("reference", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Notes / Remarks</label>
            <textarea
              placeholder="e.g. Received full amount via net banking"
              value={form.notes}
              onChange={(e) => handleInput("notes", e.target.value)}
              rows={3}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
