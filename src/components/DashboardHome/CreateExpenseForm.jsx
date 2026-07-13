import { useState } from "react";
import { useApp } from "../../context/AppContext";
import "./CreateExpenseForm.css";

const emptyForm = {
  category: "Rent & Accommodation",
  amount: "",
  date: "",
  customerName: "",
  status: "Non-Billable",
};

function CreateExpenseForm({ onSave, onCancel }) {
  const { customers, settings } = useApp();
  const [form, setForm] = useState({
    ...emptyForm,
    date: new Date().toISOString().split("T")[0],
  });

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      alert("Please enter amount and date.");
      return;
    }

    onSave({
      ...form,
      amount: Number(form.amount),
    });
  };

  return (
    <div className="zoho-expense-form-container">
      {/* Header */}
      <div className="form-page-header">
        <h2>Record Expense</h2>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="zoho-billing-form">
        {/* Core Details Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Expense Details</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label className="required-label">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleInput("category", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="Rent & Accommodation">Rent & Accommodation</option>
                <option value="Advertising & Marketing">Advertising & Marketing</option>
                <option value="IT & Internet Expenses">IT & Internet Expenses</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel Expenses">Travel Expenses</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="required-label">Amount ({settings.currency || "₹"})</label>
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

            <div className="form-field-group">
              <label className="required-label">Date</label>
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

        {/* Association Settings Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Billing & Connections</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label>Customer Name (Optional)</label>
              <select
                value={form.customerName}
                onChange={(e) => handleInput("customerName", e.target.value)}
                className="form-input-control"
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="required-label">Billing Status</label>
              <select
                value={form.status}
                onChange={(e) => handleInput("status", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="Non-Billable">Non-Billable</option>
                <option value="Billable">Billable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="customer-form-footer-actions">
          <button type="submit" className="action-footer-btn save-btn">
            Save Expense
          </button>
          
          <button type="button" className="action-footer-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExpenseForm;
