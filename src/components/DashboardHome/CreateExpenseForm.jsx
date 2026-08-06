import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import CustomerModal from "../Customer/CustomerModal";
import { LuX, LuCalendar, LuFileText, LuUser, LuTag, LuArrowLeft } from "react-icons/lu";
import { FiUploadCloud, FiSearch, FiChevronDown } from "react-icons/fi";
import "./CreateExpenseForm.css";

const emptyForm = {
  expenseId: "",
  date: "",
  category: "Bank Fee and Charges",
  amount: "",
  gstRate: "",
  reference: "",
  notes: "",
  customerName: "",
  isBillable: false,
};

function CreateExpenseForm({ onSave, onCancel }) {
  const { customers, addCustomer, settings, expenses } = useApp();

  const generateExpenseId = () => {
    const existing = expenses || [];
    if (existing.length > 0) {
      const numbers = existing.map((exp) => {
        const num = parseInt((exp.id || "").replace(/[^0-9]/g, ""), 10);
        return isNaN(num) ? 0 : num;
      });
      const nextNum = Math.max(...numbers, 0) + 1;
      return `EXP-${String(nextNum).padStart(3, "0")}`;
    }
    return "EXP-001";
  };

  const [form, setForm] = useState({
    ...emptyForm,
    expenseId: generateExpenseId(),
    date: new Date().toISOString().split("T")[0],
  });

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  // Customer search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const customerDropdownRef = useRef(null);
  const [categories, setCategories] = useState([
    "Bank Fee and Charges",
    "Rent and Accommodation",
    "Employee Salary and Advance",
    "Printing and Stationery",
    "Repair and Maintenance",
    "Telephone and Internet",
    "Transportation and Travel",
  ]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filtered customer list based on search text
  const filteredCustomers = customers.filter((c) => {
    const term = customerSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term))
    );
  });

  const handleSelectCustomer = (c) => {
    handleInput("customerName", c.name);
    setCustomerSearch(c.name);
    setShowCustomerDropdown(false);
  };

  const handleNewCustomerSave = (newCustomer) => {
    addCustomer(newCustomer);
    handleInput("customerName", newCustomer.name);
    setCustomerSearch(newCustomer.name);
    setShowNewCustomerModal(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    handleInput("category", trimmed);
    setNewCategoryInput("");
    setShowAddCategory(false);
  };

  // ----- Expense Summary Calculations -----
  const parseAmount = (val) => Number(String(val).replace(/[^0-9.]/g, "")) || 0;

  const baseAmount = parseAmount(form.amount);
  const taxRate = Number(form.gstRate) || 0;
  const taxAmount = parseFloat(((baseAmount * taxRate) / 100).toFixed(2));
  const grandTotal = parseFloat((baseAmount + taxAmount).toFixed(2));

  const formatMoney = (n) =>
    `${settings.currency || "₹"}${n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      alert("Please enter amount and date.");
      return;
    }

    onSave({
      ...form,
      id: form.expenseId || generateExpenseId(),
      tax: taxRate > 0 ? `${taxRate}%` : "Non-Taxable",
      gstRate: taxRate,
      taxAmount: taxAmount,
      amount: grandTotal > 0 ? grandTotal : baseAmount,
      status: form.isBillable ? "Billable" : "Non-Billable",
    });
  };

  return (
    <div className="zoho-expense-form-container">
      {/* Header */}
      <div className="form-page-header">
        <div className="header-title-group">
          <button type="button" className="form-back-btn" onClick={onCancel} title="Go Back">
            <LuArrowLeft size={20} />
          </button>
          <h2>Record Expense</h2>
        </div>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          <LuX size={20} />
        </button>
      </div>

      <div className="form-content-wrapper">
        <form id="expense-form" onSubmit={handleSubmit} className="zoho-billing-form">
          <div className="form-main-columns">
            {/* Left Column - Core Details */}
            <div className="form-left-col">
              <div className="form-section-card">
                <h3 className="section-card-title">Expense Details</h3>
                
                <div className="zoho-form-grid">
                  <div className="form-field-group">
                    <label className="required-label">Expense ID</label>
                    <div className="input-with-icon">
                      <LuFileText className="input-icon" size={16} />
                      <input
                        type="text"
                        value={form.expenseId}
                        readOnly
                        className="form-input-control pl-9 readonly-input"
                        title="Expense ID is automatically assigned"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="required-label">Date</label>
                    <div className="input-with-icon">
                      <LuCalendar className="input-icon" size={16} />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => handleInput("date", e.target.value)}
                        required
                        className="form-input-control pl-9"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="required-label">Category Name</label>
                    <div className="input-with-icon">
                      <LuTag className="input-icon" size={16} />
                      <select
                        value={form.category}
                        onChange={(e) => handleInput("category", e.target.value)}
                        required
                        className="form-input-control pl-9"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Add Category Button */}
                    <button
                      type="button"
                      className="add-category-btn"
                      onClick={() => setShowAddCategory(true)}
                    >
                      + Add Expense Type
                    </button>

                    {/* Inline Add Category Modal */}
                    {showAddCategory && (
                      <div className="add-category-modal">
                        <p className="add-category-modal-title">New Expense Type</p>
                        <input
                          type="text"
                          placeholder="e.g. Office Maintenance"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                          className="form-input-control"
                          autoFocus
                        />
                        <div className="add-category-modal-actions">
                          <button type="button" className="modal-confirm-btn" onClick={handleAddCategory}>Add</button>
                          <button type="button" className="modal-cancel-btn" onClick={() => { setShowAddCategory(false); setNewCategoryInput(""); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="required-label">Amount</label>
                    <div className="input-with-currency">
                      <span className="currency-symbol">{settings.currency || "₹"}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={form.amount === 0 ? "" : form.amount}
                        onChange={(e) => handleInput("amount", e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        className="form-input-control pl-10"
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>GST Rate (%)</label>
                    <div className="gst-input-wrapper" style={{ position: "relative" }}>
                      <input
                        type="number"
                        placeholder="ex. 18"
                        min="0"
                        max="100"
                        step="any"
                        value={form.gstRate}
                        onChange={(e) => handleInput("gstRate", e.target.value)}
                        className="form-input-control gst-number-input"
                        style={{ paddingRight: "28px" }}
                      />
                      <span className="gst-percent-badge">%</span>
                    </div>
                  </div>
                  
                  <div className="form-field-group full-width">
                    <label>Reference#</label>
                    <div className="input-with-icon">
                      <LuFileText className="input-icon" size={16} />
                      <input
                        type="text"
                        placeholder="Receipt or Transaction ID"
                        value={form.reference}
                        onChange={(e) => handleInput("reference", e.target.value)}
                        className="form-input-control pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="form-field-group full-width">
                    <label>Notes</label>
                    <textarea
                      placeholder="Enter expense details or notes..."
                      value={form.notes}
                      onChange={(e) => handleInput("notes", e.target.value)}
                      className="form-input-control textarea-control"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-section-card">
                <h3 className="section-card-title">Customer Details</h3>
                <div className="zoho-form-grid">
                  <div className="form-field-group" ref={customerDropdownRef}>
                    <label>Customer Name</label>
                    <div className="customer-autocomplete-wrapper">
                      <FiSearch className="customer-search-icon" size={15} />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          handleInput("customerName", e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className="customer-search-input"
                      />
                      <FiChevronDown className="customer-caret" size={14} onClick={() => setShowCustomerDropdown(!showCustomerDropdown)} />

                      {showCustomerDropdown && (
                        <div className="customer-autocomplete-dropdown">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                              <div
                                key={c.id}
                                className="customer-suggestion-row"
                                onMouseDown={() => handleSelectCustomer(c)}
                              >
                                <div className="customer-suggestion-name">{c.name}</div>
                                {c.email && <div className="customer-suggestion-sub">{c.email}</div>}
                              </div>
                            ))
                          ) : (
                            <div className="customer-no-results">No customers found</div>
                          )}
                          <div
                            className="customer-suggestion-row create-new-row"
                            onMouseDown={() => { setShowCustomerDropdown(false); setShowNewCustomerModal(true); }}
                          >
                            + New Customer
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-field-group full-width checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={form.isBillable}
                        onChange={(e) => handleInput("isBillable", e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Billable <span className="helper-text">(Reimburse from customer)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Receipt Upload */}
            <div className="form-right-col">
              <div className="form-section-card receipt-card">
                <h3 className="section-card-title">Receipt</h3>
                <div 
                  className={`receipt-upload-zone ${dragActive ? "drag-active" : ""} ${fileName ? "has-file" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FiUploadCloud size={32} className="upload-icon" />
                  {fileName ? (
                    <div className="file-success">
                      <p className="filename">{fileName}</p>
                      <button type="button" onClick={() => setFileName("")} className="remove-file">Remove</button>
                    </div>
                  ) : (
                    <>
                      <p className="upload-text">Drag & drop your receipt here</p>
                      <p className="upload-subtext">or</p>
                      <label className="browse-btn">
                        Browse Files
                        <input type="file" onChange={handleFileChange} accept="image/*,.pdf" hidden />
                      </label>
                      <p className="upload-limits">Max 5MB (JPG, PNG, PDF)</p>
                    </>
                  )}
                </div>
            </div>

            {/* Expense Summary Card */}
            <div className="form-section-card expense-summary-card">
              <h3 className="section-card-title">Expense Summary</h3>
              <div className="expense-summary-rows">
                <div className="expense-summary-row">
                  <span className="expense-summary-label">Base Amount</span>
                  <span className="expense-summary-value">{formatMoney(baseAmount)}</span>
                </div>

                <div className="expense-summary-row">
                  <span className="expense-summary-label">
                    GST / Tax ({taxRate}%)
                    {taxRate > 0 && <span className="expense-tax-badge">{taxRate}%</span>}
                  </span>
                  <span className="expense-summary-value">
                    {taxRate > 0 ? `+ ${formatMoney(taxAmount)}` : <span className="text-muted">0% (Non-Taxable)</span>}
                  </span>
                </div>

                <div className="expense-summary-divider" />

                <div className="expense-summary-total-row">
                  <span className="expense-total-label">Grand Total</span>
                  <span className="expense-total-value">{formatMoney(grandTotal)}</span>
                </div>

                {form.isBillable && (
                  <div className="expense-billable-badge">
                    <span>✓ Billable to Customer</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

      {/* Sticky Actions Footer */}
      <div className="customer-form-footer-actions">
        <button type="submit" form="expense-form" className="action-footer-btn save-btn">
          Save Expense
        </button>
        <button type="button" className="action-footer-btn save-new-btn">
          Save and New
        </button>
        <button type="button" className="action-footer-btn cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {/* New Customer Modal */}
      <CustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSave={handleNewCustomerSave}
        initialName={customerSearch}
      />
    </div>
  );
}

export default CreateExpenseForm;
