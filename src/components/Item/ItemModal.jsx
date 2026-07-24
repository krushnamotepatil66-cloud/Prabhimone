import { useState, useEffect } from "react";
import "../../components/Invoice/CreateInvoiceForm.css"; // Reuse existing popup styles
import "../Customer/CustomerModal.css";

const emptyForm = {
  type: "Product",
  name: "",
  hsnSac: "",
  price: "",
  salesTaxType: "With Tax",
  purchasePrice: "",
  purchaseTaxType: "With Tax",
  discountOnSales: "",
  discountType: "%",
  tax: "",
  unit: "",
  description: "",
};

function ItemModal({ isOpen, onClose, onSave, editingProduct, editingItem, initialName }) {
  const [form, setForm] = useState(emptyForm);

  const activeItem = editingItem || editingProduct;

  useEffect(() => {
    if (!isOpen) return;

    if (activeItem) {
      setForm({
        ...emptyForm,
        ...activeItem,
        type: activeItem.type || "Product",
        salesTaxType: activeItem.salesTaxType || "With Tax",
        purchaseTaxType: activeItem.purchaseTaxType || "With Tax",
        discountType: activeItem.discountType || "%",
        tax: activeItem.tax !== undefined && activeItem.tax !== null ? String(activeItem.tax) : "",
      });
    } else {
      setForm({
        ...emptyForm,
        name: initialName || "",
      });
    }
  }, [activeItem, isOpen, initialName]);

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
      <div className="invoice-settings-popup customer-popup-large" style={{ padding: "30px", maxWidth: "620px", width: "92%" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "#1e293b" }}>
          {activeItem ? "Edit Item" : "Quick Add Item"}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Type Selector (Product / Service) */}
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "8px", display: "block" }}>
              Item Type
            </label>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>
                <input
                  type="radio"
                  name="itemType"
                  value="Product"
                  checked={form.type === "Product"}
                  onChange={(e) => handleInput("type", e.target.value)}
                  style={{ accentColor: "#8b5cf6", width: "16px", height: "16px" }}
                />
                📦 Product (Goods)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>
                <input
                  type="radio"
                  name="itemType"
                  value="Service"
                  checked={form.type === "Service"}
                  onChange={(e) => handleInput("type", e.target.value)}
                  style={{ accentColor: "#8b5cf6", width: "16px", height: "16px" }}
                />
                🛠️ Service
              </label>
            </div>
          </div>

          <div className="quick-cust-form-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Item Name */}
            <div className="form-group full-width-span" style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                Item Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                placeholder="e.g. Wireless Keyboard / Web Dev Consultation"
                required
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            {/* HSN / SAC Code */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                {form.type === "Service" ? "SAC Code" : "HSN / SAC"}
              </label>
              <input
                type="text"
                value={form.hsnSac}
                onChange={(e) => handleInput("hsnSac", e.target.value)}
                placeholder={form.type === "Service" ? "e.g. 9983" : "e.g. 8471"}
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            {/* Unit */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => handleInput("unit", e.target.value)}
                placeholder={form.type === "Service" ? "Hour, Project, etc." : "Pcs, Box, Nos, Kg"}
                style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }}
              />
            </div>

            {/* Sales Price */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                Sales Price <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                overflow: "hidden",
                background: "#fff"
              }}>
                <span style={{ padding: "0 2px 0 10px", color: "#64748b", fontWeight: "500", fontSize: "14px" }}>₹</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleInput("price", e.target.value)}
                  placeholder="ex: ₹200"
                  required
                  min="0"
                  step="any"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "10px 6px",
                    fontSize: "14px",
                    background: "transparent",
                    width: "100%"
                  }}
                />
                <select
                  value={form.salesTaxType || "With Tax"}
                  onChange={(e) => handleInput("salesTaxType", e.target.value)}
                  style={{
                    border: "none",
                    borderLeft: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    padding: "10px 10px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#475569",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="With Tax">With Tax</option>
                  <option value="Without Tax">Without Tax</option>
                </select>
              </div>
            </div>

            {/* Purchase Price */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Purchase Price</label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                overflow: "hidden",
                background: "#fff"
              }}>
                <span style={{ padding: "0 2px 0 10px", color: "#64748b", fontWeight: "500", fontSize: "14px" }}>₹</span>
                <input
                  type="number"
                  value={form.purchasePrice}
                  onChange={(e) => handleInput("purchasePrice", e.target.value)}
                  placeholder="ex: ₹150"
                  min="0"
                  step="any"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "10px 6px",
                    fontSize: "14px",
                    background: "transparent",
                    width: "100%"
                  }}
                />
                <select
                  value={form.purchaseTaxType || "With Tax"}
                  onChange={(e) => handleInput("purchaseTaxType", e.target.value)}
                  style={{
                    border: "none",
                    borderLeft: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    padding: "10px 10px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#475569",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="With Tax">With Tax</option>
                  <option value="Without Tax">Without Tax</option>
                </select>
              </div>
            </div>

            {/* Discount on Sales */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Discount on Sales</label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                overflow: "hidden",
                background: "#fff"
              }}>
                <input
                  type="number"
                  value={form.discountOnSales}
                  onChange={(e) => handleInput("discountOnSales", e.target.value)}
                  placeholder="ex: 10"
                  min="0"
                  step="any"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "transparent",
                    width: "100%"
                  }}
                />
                <select
                  value={form.discountType || "%"}
                  onChange={(e) => handleInput("discountType", e.target.value)}
                  style={{
                    border: "none",
                    borderLeft: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#475569",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="%">%</option>
                  <option value="₹">₹</option>
                </select>
              </div>
            </div>

            {/* GST Rate */}
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>GST Rate (%)</label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                overflow: "hidden",
                background: "#fff"
              }}>
                <input
                  type="number"
                  value={form.tax}
                  onChange={(e) => handleInput("tax", e.target.value)}
                  placeholder="ex: 18"
                  min="0"
                  max="100"
                  step="any"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "transparent",
                    width: "100%"
                  }}
                />
                <span style={{
                  borderLeft: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569"
                }}>%</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group full-width-span" style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleInput("description", e.target.value)}
                rows="2"
                placeholder="Item notes, specifications or details..."
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
              {activeItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;
