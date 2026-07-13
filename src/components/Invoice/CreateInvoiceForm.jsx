import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import CreateCustomerForm from "../Customer/CreateCustomerForm";
import "./CreateInvoiceForm.css";

const emptyForm = {
  customer: "",
  invoiceId: "",
  orderNumber: "",
  date: new Date().toISOString().split("T")[0],
  terms: "Net 30",
  dueDate: "",
  items: [
    {
      product: "",
      qty: 1,
      price: 0,
      tax: 18, // Default GST tax rate percentage
    },
  ],
  discount: 0,
  discountType: "%",
  adjustment: 0,
  notes: "Thanks for your business.",
  termsAndConditions: "Please pay within the due date.",
};

function CreateInvoiceForm({ editingInvoice, onSave, onCancel }) {
  const { customers, invoices, addCustomer, settings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Auto calculate due date when date or terms change
  useEffect(() => {
    if (!form.date) return;

    const baseDate = new Date(form.date);
    let offsetDays = 0;

    switch (form.terms) {
      case "Due on Receipt":
        offsetDays = 0;
        break;
      case "Net 15":
        offsetDays = 15;
        break;
      case "Net 30":
        offsetDays = 30;
        break;
      case "Net 45":
        offsetDays = 45;
        break;
      case "Net 60":
        offsetDays = 60;
        break;
      case "Custom":
        // Keep user input or default to current due date
        return;
      default:
        offsetDays = 30;
    }

    baseDate.setDate(baseDate.getDate() + offsetDays);
    const calculatedDueDate = baseDate.toISOString().split("T")[0];
    
    setForm((prev) => ({
      ...prev,
      dueDate: calculatedDueDate,
    }));
  }, [form.date, form.terms]);

  // Load editing invoice details if available
  useEffect(() => {
    if (editingInvoice) {
      const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

      // Fill in invoice parameters
      setForm({
        customer: editingInvoice.customer,
        invoiceId: editingInvoice.id,
        orderNumber: editingInvoice.orderNumber || "",
        date: editingInvoice.date,
        terms: editingInvoice.terms || "Net 30",
        dueDate: editingInvoice.dueDate || editingInvoice.date,
        items: editingInvoice.items && editingInvoice.items.length > 0
          ? editingInvoice.items.map(item => ({
              product: item.product,
              qty: item.qty,
              price: item.price,
              tax: item.tax !== undefined ? item.tax : 18
            }))
          : [{ product: "Service Charges", qty: 1, price: parseAmount(editingInvoice.amount), tax: 18 }],
        discount: editingInvoice.discount || 0,
        discountType: editingInvoice.discountType || "%",
        adjustment: editingInvoice.adjustment || 0,
        notes: editingInvoice.notes || "Thanks for your business.",
        termsAndConditions: editingInvoice.termsAndConditions || "Please pay within the due date.",
      });
    } else {
      // Auto-generate invoice id
      const nextId = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
      setForm({
        ...emptyForm,
        invoiceId: nextId,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [editingInvoice, invoices.length]);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    if (field === "product") {
      updatedItems[index][field] = value;
    } else if (field === "amount") {
      const amt = Number(value);
      const qty = Number(updatedItems[index].qty) || 1;
      updatedItems[index].price = qty > 0 ? Number((amt / qty).toFixed(2)) : amt;
    } else {
      updatedItems[index][field] = Number(value);
    }

    setForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: "", qty: 1, price: 0, tax: 18 },
      ],
    }));
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Inline Customer Creation Save
  const handleQuickCustomerSave = (newCust) => {
    const savedCust = addCustomer(newCust);
    setForm((prev) => ({
      ...prev,
      customer: savedCust.name,
    }));
    setIsCreatingCustomer(false);
  };

  // Math Calculations
  const subtotal = form.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (form.discountType === "%") {
    discountAmount = (subtotal * Number(form.discount)) / 100;
  } else {
    discountAmount = Number(form.discount) || 0;
  }

  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);

  // Calculate tax per item (allowing custom tax rates)
  const totalTax = form.items.reduce((sum, item) => {
    const itemSub = item.qty * item.price;
    // Distribute discount proportionally across items for accurate tax computation
    const proportionalDiscount = subtotal > 0 ? (itemSub / subtotal) * discountAmount : 0;
    const taxableItemAmount = Math.max(0, itemSub - proportionalDiscount);
    return sum + (taxableItemAmount * item.tax) / 100;
  }, 0);

  const grandTotal = Math.max(0, amountAfterDiscount + totalTax + Number(form.adjustment));

  const handleSubmitForm = (e, forceStatus) => {
    e.preventDefault();
    if (!form.customer) {
      alert("Please select a customer.");
      return;
    }
    if (form.items.some((item) => !item.product || item.price <= 0)) {
      alert("Please ensure all items have a description and pricing details.");
      return;
    }

    onSave({
      id: form.invoiceId,
      customer: form.customer,
      date: form.date,
      terms: form.terms,
      dueDate: form.dueDate,
      orderNumber: form.orderNumber,
      status: forceStatus || (editingInvoice ? editingInvoice.status : "Pending"),
      amount: `${settings.currency || "₹"}${grandTotal.toLocaleString()}`,
      items: form.items,
      discount: Number(form.discount),
      discountType: form.discountType,
      adjustment: Number(form.adjustment),
      notes: form.notes,
      termsAndConditions: form.termsAndConditions,
    });
  };

  // Sub-view: Inline Create Customer Form
  if (isCreatingCustomer) {
    return (
      <CreateCustomerForm
        editingCustomer={null}
        onSave={handleQuickCustomerSave}
        onCancel={() => setIsCreatingCustomer(false)}
      />
    );
  }

  return (
    <div className="zoho-invoice-form-container">
      {/* Form Header */}
      <div className="form-page-header">
        <h2>{editingInvoice ? `Edit Invoice (${form.invoiceId})` : "New Invoice"}</h2>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          &times;
        </button>
      </div>

      <form onSubmit={(e) => handleSubmitForm(e)} className="zoho-billing-form">
        {/* Customer Select Section */}
        <div className="form-section-card">
          <div className="form-input-row customer-row-select">
            <div className="form-field-group width-50">
              <label className="required-label">Customer Name</label>
              <div className="customer-select-flex">
                <select
                  value={form.customer}
                  onChange={(e) => handleInput("customer", e.target.value)}
                  required
                  className="form-select-control"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="quick-add-customer-btn"
                  onClick={() => setIsCreatingCustomer(true)}
                  title="Create Customer Inline"
                >
                  + New Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Parameters Grid Section */}
        <div className="form-section-card">
          <div className="invoice-fields-grid">
            <div className="form-field-group">
              <label className="required-label">Invoice#</label>
              <input
                type="text"
                value={form.invoiceId}
                onChange={(e) => handleInput("invoiceId", e.target.value)}
                required
                className="form-input-control"
                placeholder="INV-XXX"
              />
            </div>

            <div className="form-field-group">
              <label>Order Number</label>
              <input
                type="text"
                value={form.orderNumber}
                onChange={(e) => handleInput("orderNumber", e.target.value)}
                className="form-input-control"
                placeholder="Order Reference"
              />
            </div>

            <div className="form-field-group">
              <label className="required-label">Invoice Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleInput("date", e.target.value)}
                required
                className="form-input-control"
              />
            </div>

            <div className="form-field-group">
              <label>Payment Terms</label>
              <select
                value={form.terms}
                onChange={(e) => handleInput("terms", e.target.value)}
                className="form-select-control"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Custom">Custom Date</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="required-label">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => handleInput("dueDate", e.target.value)}
                disabled={form.terms !== "Custom"}
                required
                className="form-input-control"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Items Table Grid */}
        <div className="form-section-card no-padding">
          <table className="form-items-table">
            <thead>
              <tr>
                <th width="40%">Item Details</th>
                <th width="15%" style={{ textAlign: "right" }}>Quantity</th>
                <th width="18%" style={{ textAlign: "right" }}>Rate</th>
                <th width="15%">Tax (GST %)</th>
                <th width="12%" style={{ textAlign: "right" }}>Amount</th>
                <th width="50"></th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, index) => {
                const itemAmount = item.qty * item.price;
                return (
                  <tr key={index}>
                    <td data-label="Item Details">
                      <input
                        type="text"
                        placeholder="Type product name or service description..."
                        value={item.product}
                        onChange={(e) => handleItemChange(index, "product", e.target.value)}
                        required
                        className="form-input-control"
                      />
                    </td>
                    <td data-label="Quantity">
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.qty === 0 ? "" : item.qty}
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        required
                        style={{ textAlign: "right" }}
                        className="form-input-control"
                      />
                    </td>
                    <td data-label="Rate">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        required
                        style={{ textAlign: "right" }}
                        className="form-input-control"
                      />
                    </td>
                    <td data-label="Tax (GST %)">
                      <select
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                        className="form-select-control"
                      >
                        <option value="0">Non-Taxable (0%)</option>
                        <option value="5">GST (5%)</option>
                        <option value="12">GST (12%)</option>
                        <option value="18">GST (18%)</option>
                        <option value="28">GST (28%)</option>
                      </select>
                    </td>
                    <td data-label="Amount">
                      <div className="amount-input-wrapper">
                        <span className="currency-symbol">{settings.currency || "₹"}</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={itemAmount === 0 ? "" : itemAmount}
                          onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                          className="form-input-control item-amount-input"
                          style={{ textAlign: "right", fontWeight: "600" }}
                        />
                      </div>
                    </td>
                    <td data-label="Action">
                      <button
                        type="button"
                        className="item-row-delete-btn"
                        onClick={() => removeItemRow(index)}
                        disabled={form.items.length === 1}
                        title="Remove row"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ padding: "16px" }}>
            <button type="button" className="add-line-row-btn" onClick={addItemRow}>
              + Add another line
            </button>
          </div>
        </div>

        {/* Notes and Totals Grid */}
        <div className="totals-notes-split">
          <div className="form-notes-col">
            <div className="form-field-group">
              <label>Customer Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleInput("notes", e.target.value)}
                className="form-textarea-control"
                rows="3"
                placeholder="Notes shown on invoice..."
              />
            </div>
            
            <div className="form-field-group">
              <label>Terms & Conditions</label>
              <textarea
                value={form.termsAndConditions}
                onChange={(e) => handleInput("termsAndConditions", e.target.value)}
                className="form-textarea-control"
                rows="3"
                placeholder="Payment policies..."
              />
            </div>
          </div>

          <div className="form-totals-col">
            <div className="totals-summary-card">
              <div className="totals-calc-row">
                <span>Sub Total:</span>
                <span className="bold-calc-val">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="totals-calc-row">
                <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  Discount: 
                  <input 
                    type="number"
                    value={form.discount === 0 ? "" : form.discount}
                    onChange={(e) => handleInput("discount", Number(e.target.value) || 0)}
                    className="calc-small-input"
                  />
                  <select
                    value={form.discountType}
                    onChange={(e) => handleInput("discountType", e.target.value)}
                    className="calc-small-select"
                  >
                    <option value="%">%</option>
                    <option value="Flat">₹</option>
                  </select>
                </span>
                <span>- ₹{discountAmount.toLocaleString()}</span>
              </div>

              <div className="totals-calc-row">
                <span>Tax (GST Amount):</span>
                <span>₹{totalTax.toLocaleString()}</span>
              </div>

              <div className="totals-calc-row">
                <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  Adjustment:
                  <input
                    type="number"
                    value={form.adjustment === 0 ? "" : form.adjustment}
                    onChange={(e) => handleInput("adjustment", Number(e.target.value) || 0)}
                    className="calc-small-input width-70"
                    placeholder="0"
                  />
                </span>
                <span>₹{(Number(form.adjustment) || 0).toLocaleString()}</span>
              </div>

              <hr className="totals-divider" />

              <div className="totals-calc-row grand-total-row">
                <span>Grand Total:</span>
                <span className="grand-total-calc-val">
                  {settings.currency || "₹"}{grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Actions Bar at Footer */}
        <div className="invoice-form-footer-actions">
          <button
            type="button"
            className="action-footer-btn save-send-btn"
            onClick={(e) => handleSubmitForm(e, "Pending")}
          >
            Save and Send
          </button>
          
          <button
            type="button"
            className="action-footer-btn save-draft-btn"
            onClick={(e) => handleSubmitForm(e, "Draft")}
          >
            Save as Draft
          </button>
          
          <button
            type="button"
            className="action-footer-btn cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoiceForm;
