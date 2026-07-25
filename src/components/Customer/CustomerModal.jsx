import { useState, useEffect } from "react";
import "../../components/Invoice/CreateInvoiceForm.css"; // Reuse existing popup styles
import "./CustomerModal.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "+91",
  company: "",
  address: "",
  city: "",
};

function CustomerModal({ isOpen, onClose, onSave, editingCustomer }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (editingCustomer) {
      setForm(editingCustomer);
    } else {
      setForm(emptyForm);
    }
  }, [editingCustomer, isOpen]);

  if (!isOpen) return null;

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="invoice-settings-popup-overlay">
      <div className="invoice-settings-popup customer-popup-large" style={{ padding: "30px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "24px", color: "#1e293b" }}>
          {editingCustomer ? "Edit Customer" : "Quick Add Customer"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="quick-cust-form-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Customer Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                required
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInput("email", e.target.value)}
                placeholder="customer@email.com"
                required
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleInput("phone", e.target.value)}
                placeholder="+91 00000 00000"
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Company Name</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleInput("company", e.target.value)}
                placeholder="Company LLC"
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleInput("city", e.target.value)}
                placeholder="Pune"
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group full-width-span" style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Billing Address</label>
              <textarea
                value={form.address}
                onChange={(e) => handleInput("address", e.target.value)}
                placeholder="123 Road, St."
                rows="2"
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", resize: "vertical" }}
              />
            </div>
          </div>

          <div className="popup-actions" style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontWeight: "600", color: "#0f172a", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: "10px 20px", background: "#8b5cf6", border: "none", borderRadius: "6px", fontWeight: "600", color: "#fff", cursor: "pointer" }}
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerModal;
