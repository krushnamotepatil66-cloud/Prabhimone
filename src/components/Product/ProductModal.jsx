import { useState, useEffect } from "react";
import "../../components/Invoice/CreateInvoiceForm.css"; // Reuse existing popup styles
import "../Customer/CustomerModal.css";

const emptyForm = {
  name: "",
  hsnSac: "",
  price: "",
  unit: "",
  description: "",
};

function ProductModal({ isOpen, onClose, onSave, editingProduct, initialName }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setForm(editingProduct);
    } else {
      setForm({
        ...emptyForm,
        name: initialName || "",
      });
    }
  }, [editingProduct, isOpen, initialName]);

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
          {editingProduct ? "Edit Product" : "Quick Add Product"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="quick-cust-form-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group full-width-span" style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                required
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>HSN / SAC</label>
              <input
                type="text"
                value={form.hsnSac}
                onChange={(e) => handleInput("hsnSac", e.target.value)}
                placeholder="e.g. 9983"
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Selling Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleInput("price", e.target.value)}
                required
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>
            
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => handleInput("unit", e.target.value)}
                placeholder="Hour, Project, Kg, etc."
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            <div className="form-group full-width-span" style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleInput("description", e.target.value)}
                rows="3"
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
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
