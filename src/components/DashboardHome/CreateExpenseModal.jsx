import { useState } from "react";
import { useApp } from "../../context/AppContext";
import "../Invoice/CreateInvoiceModal.css"; // Reuse modal classes

function CreateExpenseModal({ isOpen, onClose }) {
  const { customers, addExpense } = useApp();
  const [form, setForm] = useState({
    category: "Rent & Accommodation",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    status: "Non-Billable",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      alert("Please enter amount and date.");
      return;
    }

    addExpense({
      ...form,
      amount: Number(form.amount),
    });

    // Reset and close
    setForm({
      category: "Rent & Accommodation",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      status: "Non-Billable",
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Record Expense</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="Rent & Accommodation">Rent & Accommodation</option>
              <option value="Advertising & Marketing">Advertising & Marketing</option>
              <option value="IT & Internet Expenses">IT & Internet Expenses</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Travel Expenses">Travel Expenses</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={form.amount === 0 ? "" : form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Customer (Optional)</label>
            <select
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="Non-Billable">Non-Billable</option>
              <option value="Billable">Billable</option>
            </select>
          </div>

          <div className="modal-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                background: "#1b75bb",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExpenseModal;
