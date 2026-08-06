import { useState, useEffect, useRef } from "react";
import { FiX, FiPlus, FiTrash2, FiSave, FiAlertCircle, FiChevronDown, FiUser, FiFileText, FiPackage, FiEdit3, FiCreditCard, FiSettings, FiPaperclip } from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import ProductModal from "../Product/ProductModal";
import VendorModal from "./VendorModal";
import "../Invoice/CreateInvoiceForm.css";
import "./CreatePurchaseForm.css";

function CreatePurchaseForm({ onSave, onCancel, title = "New Purchase Order", submitText = "Save Purchase Order" }) {
  const { settings, products, addProduct, vendors, addVendor, purchases } = useApp();

  const getDefaultTerms = (docTitle, s) => {
    if (docTitle.toLowerCase().includes("bill")) return s.billTermsAndConditions || "";
    if (docTitle.toLowerCase().includes("order")) return s.purchaseOrderTermsAndConditions || "";
    return s.purchaseOrderTermsAndConditions || "";
  };

  const [formData, setFormData] = useState({
    purchaseNo: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    reference: "",
    paymentMode: "Bank Transfer",
    status: "Pending",
    notes: "",
    internalNote: "",
    termsAndConditions: getDefaultTerms(title, settings),
  });
  
  const [items, setItems] = useState([
    { product: "", description: "", hsn: "", qty: "1", unit: "Nos", price: "0", discount: "", discountType: "Flat", tax: "0" }
  ]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [activeProductDropdownIndex, setActiveProductDropdownIndex] = useState(null);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [addingProductRowIndex, setAddingProductRowIndex] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const dropdownRef = useRef(null);

  const filteredVendors = (vendors || []).filter((v) => {
    const term = (formData.vendor || "").toLowerCase().trim();
    if (!term) return true;
    return (
      v.name.toLowerCase().includes(term) ||
      (v.company && v.company.toLowerCase().includes(term))
    );
  });

  const handleSelectVendor = (v) => {
    setFormData((prev) => ({
      ...prev,
      vendor: v.name,
    }));
    setShowDropdown(false);
    setShowNewVendorForm(false);
  };

  const [errors, setErrors] = useState({});
  const cur = settings?.currency || "₹";

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product: "", description: "", hsn: "", qty: "1", unit: "Nos", price: "0", discount: "", discountType: "Flat", tax: "0" }
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor.trim()) newErrors.vendor = "Vendor name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Date is required";
    
    let hasInvalidItems = false;
    items.forEach((item) => {
      if (!item.product.trim()) hasInvalidItems = true;
    });
    
    if (hasInvalidItems) {
      newErrors.items = "All items must have a product name";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Please fill in all required fields (Vendor, Category, Date, and Item Name).");
      return false;
    }
    return true;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    
    items.forEach((item) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      let baseAmount = qty * price;
      
      let discountAmt = 0;
      const discountVal = Number(item.discount) || 0;
      if (item.discountType === "%") {
        discountAmt = baseAmount * (discountVal / 100);
      } else {
        discountAmt = discountVal;
      }
      
      const discountedAmount = baseAmount - discountAmt;
      const taxRate = Number(item.tax) || 0;
      const taxAmt = discountedAmount * (taxRate / 100);
      
      subTotal += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
    });
    
    return { subTotal, totalDiscount, totalTax, total: subTotal - totalDiscount + totalTax };
  };

  useEffect(() => {
    if (!formData.purchaseNo) {
      const isBill = title.toLowerCase().includes("bill");
      const isOrder = title.toLowerCase().includes("order");
      const prefix = isBill ? "BILL-" : isOrder ? "PO-" : "PUR-";
      
      const numbers = (purchases || [])
        .filter(p => String(p.id || p.purchaseNo || "").startsWith(prefix))
        .map((p) => {
          const idStr = String(p.id || p.purchaseNo || "");
          const match = idStr.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        });
        
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNum = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
      setFormData((prev) => ({ ...prev, purchaseNo: nextNum }));
    }
  }, [purchases, title, formData.purchaseNo]);

  const handleSaveSettings = (newCurrency, newTaxRate) => {
    if (settings) {
      settings.currency = newCurrency;
      settings.taxRate = Number(newTaxRate) || 18;
    }
    setShowSettingsModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const totals = calculateTotals();
      const isBill = title.toLowerCase().includes("bill");
      const isOrder = title.toLowerCase().includes("order");
      const prefix = isBill ? "BILL-" : isOrder ? "PO-" : "PUR-";
      
      onSave({
        ...formData,
        id: formData.purchaseNo ? formData.purchaseNo.trim() : `${prefix}${Math.floor(Math.random() * 10000)}`,
        items,
        amount: totals.subTotal,
        tax: totals.totalTax,
        total: totals.total,
      });
    }
  };

  const { subTotal, totalDiscount, totalTax, total } = calculateTotals();

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (!event.target.closest('.product-dropdown-container')) {
        setActiveProductDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="new-invoice-page-container cpf-main-wrapper" style={{ paddingTop: '8px' }}>
      <div className="new-invoice-header-row" style={{ marginBottom: '12px' }}>
        <div className="new-invoice-header-left">
          <div className="breadcrumb-nav">
            <span>Home</span> &gt; <span>{title.includes("Bill") ? "Bills" : title.includes("Order") ? "Purchase Orders" : "Purchases"}</span> &gt; <span className="active">Create</span>
          </div>
          <h1 className="new-invoice-page-title">{title}</h1>
        </div>
        <div className="new-invoice-header-right">
          <button className="cpf-close-btn" onClick={onCancel} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
      </div>

      <form className="new-invoice-form-layout" onSubmit={handleSubmit}>
        
        {/* ROW 1: Vendor & Purchase Details */}
        <div className="invoice-form-row invoice-form-row-top">
          {/* Vendor Card */}
          <div className="new-invoice-card invoice-form-row-left" style={{ flex: '1' }}>
            <div className="card-header">
              <span className="card-header-icon"><FiUser /></span>
              <h2>Vendor Details</h2>
            </div>
            <div className="card-body">
              <div className="form-group" ref={dropdownRef}>
                <label className="required-field">Vendor Name</label>
                <div className="autocomplete-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => {
                      setFormData({ ...formData, vendor: e.target.value });
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const exactMatch = filteredVendors.find(
                          (v) => v.name.trim().toLowerCase() === formData.vendor.trim().toLowerCase()
                        );
                        if (exactMatch) {
                          handleSelectVendor(exactMatch);
                        } else {
                          setShowNewVendorForm(true);
                          setShowDropdown(false);
                        }
                      }
                    }}
                    placeholder="Search vendors..."
                    className={errors.vendor ? "error" : ""}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                  <span className="dropdown-caret-arrow" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}><FiChevronDown /></span>

                  {showDropdown && (
                    <div className="autocomplete-suggestions">
                      {filteredVendors.map((v, idx) => (
                        <div
                          key={idx}
                          className="suggestion-row"
                          onClick={() => handleSelectVendor(v)}
                        >
                          <div>{v.name}</div>
                          {v.email && <div className="subtext">{v.email}</div>}
                        </div>
                      ))}
                      <div
                        className="suggestion-row create-option"
                        onClick={() => setShowNewVendorForm(true)}
                      >
                        + Create New Vendor
                      </div>
                    </div>
                  )}
                </div>
                {errors.vendor && <span className="cpf-err-msg" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.vendor}</span>}
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="required-field">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={errors.category ? "error" : ""}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                >
                  <option value="">Select Category</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <span className="cpf-err-msg" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.category}</span>}
              </div>
            </div>
          </div>

          {/* Purchase / Bill Details Card */}
          <div className="new-invoice-card invoice-form-row-right" style={{ flex: '1' }}>
            <div className="card-header">
              <span className="card-header-icon"><FiFileText /></span>
              <h2>{title.includes("Bill") ? "Bill Details" : title.includes("Order") ? "Purchase Order Details" : "Purchase Details"}</h2>
            </div>
            <div className="card-body">
              <div className="form-group input-with-icon-group">
                <label className="required-field">{title.includes("Bill") ? "Bill #" : title.includes("Order") ? "Purchase Order #" : "Purchase #"}</label>
                <div className="input-with-side-button">
                  <input
                    type="text"
                    value={formData.purchaseNo || ""}
                    onChange={(e) => setFormData({ ...formData, purchaseNo: e.target.value })}
                    placeholder={title.includes("Bill") ? "BILL-001" : title.includes("Order") ? "PO-001" : "PUR-001"}
                  />
                  <button type="button" className="input-side-settings-btn" onClick={() => setShowSettingsModal(true)}>
                    <FiSettings />
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="required-field">{title.includes("Bill") ? "Bill Date" : "Purchase Date"}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={errors.date ? "error" : ""}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                {errors.date && <span className="cpf-err-msg" style={{ color: '#ef4444', fontSize: '12px' }}>{errors.date}</span>}
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Reference #</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Reference or bill number"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Items Table */}
        <div className="invoice-form-row">
          <div className="new-invoice-card w-full">
            <div className="card-header">
              <span className="card-header-icon"><FiPackage /></span>
              <h2>Items Purchased</h2>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div className="responsive-table-container" style={{ border: 'none', borderRadius: '0' }}>
                <table className="new-items-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: "35%", paddingLeft: "24px" }}>Item Details</th>
                      <th style={{ width: "10%" }}>HSN/SAC</th>
                      <th style={{ width: "8%" }} className="align-center">Qty</th>
                      <th style={{ width: "8%" }} className="align-center">Unit</th>
                      <th style={{ width: "12%" }} className="align-right">Rate (₹)</th>
                      <th style={{ width: "8%" }} className="align-center">GST (%)</th>
                      <th style={{ width: "14%" }} className="align-center">Discount</th>
                      <th style={{ width: "15%", paddingRight: "24px" }} className="align-right">Amount (₹)</th>
                      <th style={{ width: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const qty = Number(item.qty) || 0;
                      const price = Number(item.price) || 0;
                      const tax = Number(item.tax) || 0;
                      let baseAmount = qty * price;
                      
                      let discountAmt = 0;
                      const discountVal = Number(item.discount) || 0;
                      if (item.discountType === "%") {
                        discountAmt = baseAmount * (discountVal / 100);
                      } else {
                        discountAmt = discountVal;
                      }
                      
                      const discountedAmount = baseAmount - discountAmt;
                      const rowAmount = discountedAmount + (discountedAmount * (tax / 100));

                      return (
                         <tr key={index}>
                          <td style={{ paddingLeft: "24px" }}>
                            <div className="item-name-fields product-dropdown-container" style={{ position: "relative" }}>
                              <div className="autocomplete-input-wrapper">
                                <input
                                  type="text"
                                  value={item.product}
                                  onChange={(e) => {
                                    handleItemChange(index, "product", e.target.value);
                                    setActiveProductDropdownIndex(index);
                                    setFocusedSuggestionIndex(0);
                                  }}
                                  onFocus={() => {
                                    setActiveProductDropdownIndex(index);
                                    setFocusedSuggestionIndex(0);
                                  }}
                                  onKeyDown={(e) => {
                                    const filtered = products.filter((p) =>
                                      p.name.toLowerCase().includes((item.product || "").toLowerCase())
                                    );
                                    const totalOptions = filtered.length + 1;

                                    if (e.key === "ArrowDown") {
                                      e.preventDefault();
                                      setFocusedSuggestionIndex((prev) => (prev + 1) % totalOptions);
                                    } else if (e.key === "ArrowUp") {
                                      e.preventDefault();
                                      setFocusedSuggestionIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
                                    } else if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < filtered.length) {
                                        const p = filtered[focusedSuggestionIndex];
                                        handleItemChange(index, "product", p.name);
                                        handleItemChange(index, "description", p.description || "");
                                        handleItemChange(index, "hsn", p.hsnSac || p.hsn || "");
                                        handleItemChange(index, "unit", p.unit || "Nos");
                                        handleItemChange(index, "price", p.purchasePrice || p.price || 0);
                                        if (p.tax !== undefined && p.tax !== null && p.tax !== "") {
                                          handleItemChange(index, "tax", p.tax);
                                        }
                                        setActiveProductDropdownIndex(null);
                                      } else if (focusedSuggestionIndex === filtered.length) {
                                        setAddingProductRowIndex(index);
                                        setShowProductModal(true);
                                        setActiveProductDropdownIndex(null);
                                      }
                                    } else if (e.key === "Escape") {
                                      setActiveProductDropdownIndex(null);
                                    }
                                  }}
                                  placeholder="Item name"
                                  className="item-title-input"
                                  style={{ width: "100%" }}
                                />
                                {activeProductDropdownIndex === index && (
                                  <div className="autocomplete-suggestions" style={{ top: "100%", width: "100%", minWidth: "250px", zIndex: 100 }}>
                                    {products
                                      .filter((p) => p.name.toLowerCase().includes((item.product || "").toLowerCase()))
                                      .map((p, pIdx) => (
                                        <div
                                          key={p.id || pIdx}
                                          className="suggestion-row"
                                          style={{
                                            backgroundColor: focusedSuggestionIndex === pIdx ? "var(--primary-purple-light)" : ""
                                          }}
                                          onClick={() => {
                                            handleItemChange(index, "product", p.name);
                                            handleItemChange(index, "description", p.description || "");
                                            handleItemChange(index, "hsn", p.hsnSac || p.hsn || "");
                                            handleItemChange(index, "unit", p.unit || "Nos");
                                            handleItemChange(index, "price", p.purchasePrice || p.price || 0);
                                            if (p.tax !== undefined && p.tax !== null && p.tax !== "") {
                                              handleItemChange(index, "tax", p.tax);
                                            }
                                            setActiveProductDropdownIndex(null);
                                          }}
                                        >
                                          <div>{p.name}</div>
                                          {(p.purchasePrice || p.price) && <div className="subtext">₹{Number(p.purchasePrice || p.price).toLocaleString()}</div>}
                                        </div>
                                      ))}
                                    <div
                                      className="suggestion-row create-option"
                                      style={{
                                        backgroundColor: focusedSuggestionIndex === products.filter((p) => p.name.toLowerCase().includes((item.product || "").toLowerCase())).length ? "var(--primary-purple-light)" : ""
                                      }}
                                      onClick={() => {
                                        setAddingProductRowIndex(index);
                                        setShowProductModal(true);
                                        setActiveProductDropdownIndex(null);
                                      }}
                                    >
                                      + Quick Add Item
                                    </div>
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                placeholder="SKU/Description"
                                className="item-subtitle-input"
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.hsn}
                              onChange={(e) => handleItemChange(index, "hsn", e.target.value)}
                              placeholder="HSN"
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                              className="align-center"
                              style={{ width: '100%', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              placeholder="Nos"
                              className="align-center"
                              style={{ width: '100%', textAlign: 'center' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", e.target.value)}
                              className="align-right"
                              style={{ width: '100%', textAlign: 'right' }}
                            />
                          </td>
                          <td>
                            <div className="gst-input-wrapper" style={{ position: 'relative' }}>
                              <input
                                type="number"
                                value={item.tax}
                                onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                                className="align-center"
                                style={{ width: '100%', textAlign: 'center', paddingRight: '15px' }}
                              />
                              <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#64748b' }}>%</span>
                            </div>
                          </td>
                          <td>
                            <div className="discount-input-wrapper" style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", width: "100%", minWidth: "75px" }}>
                              <input
                                type="text"
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                                className="align-right discount-input"
                                style={{ flex: 1, minWidth: "30px", width: "100%", border: "none", outline: "none", padding: "6px", fontSize: "13px" }}
                              />
                              <select
                                value={item.discountType === "%" ? "%" : "Flat"}
                                onChange={(e) => handleItemChange(index, "discountType", e.target.value)}
                                style={{ flexShrink: 0, width: "auto", border: "none", borderLeft: "1px solid #e2e8f0", background: "#f8fafc", padding: "6px 2px", fontSize: "12px", fontWeight: "600", color: "#64748b", outline: "none", cursor: "pointer" }}
                              >
                                <option value="Flat">₹</option>
                                <option value="%">%</option>
                              </select>
                            </div>
                          </td>
                          <td className="align-right" style={{ paddingRight: "24px", fontWeight: "600", color: "#1e293b" }}>
                            ₹{rowAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="cpf-del-item"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Actions */}
              <div className="table-bottom-actions-row" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="action-buttons-flex" style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-purple-outline" onClick={addItem} style={{ backgroundColor: '#fff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    <FiPlus style={{ marginRight: "4px" }} /> Add Item
                  </button>
                </div>
                <div className="total-items-badge" style={{ fontSize: '13px', color: '#64748b', backgroundColor: '#fff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  Total Items: <span className="font-semibold" style={{ fontWeight: '600', color: '#1e293b' }}>{items.length}</span>
                </div>
              </div>
            </div>
            {errors.items && (
              <div className="cpf-items-err" style={{ padding: '16px 24px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertCircle /> {errors.items}
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Notes & Terms (left) + Summary & Payment (right) */}
        <div className="invoice-form-row invoice-form-row-bottom">
          {/* Left Column wrapper for Notes and Upload */}
          <div className="invoice-form-row-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Notes Card */}
            <div className="new-invoice-card" style={{ margin: 0 }}>
              <div className="card-header">
                <span className="card-header-icon"><FiEdit3 /></span>
                <h2>Terms &amp; Conditions</h2>
              </div>

              <div className="card-body">
                <div className="notes-split-row" style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group flex-1" style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Notes</label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any notes or special instructions..."
                      rows="3"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", resize: "none", outline: "none" }}
                    />
                  </div>
                  <div className="form-group flex-1" style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Internal Note</label>
                    <textarea
                      value={formData.internalNote || ""}
                      onChange={(e) => setFormData({ ...formData, internalNote: e.target.value })}
                      placeholder="For internal use only..."
                      rows="3"
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", resize: "none", outline: "none" }}
                    />
                  </div>
                </div>
                <div className="form-group terms-textarea-stack">
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Terms and Conditions</label>
                  <textarea
                    value={formData.termsAndConditions || ""}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    placeholder="Enter terms and conditions..."
                    rows="6"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", resize: "none", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Attach File Card */}
            <div className="new-invoice-card" style={{ margin: 0 }}>
              <div className="card-header">
                <span className="card-header-icon"><FiPaperclip /></span>
                <h2>Attach File(s)</h2>
              </div>
              <div className="card-body">
                <div className="upload-file-area" style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Click or drag file(s) here to upload</p>
                    <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Maximum file size: 5MB</p>
                  </div>
                  <input type="file" multiple style={{ display: 'none' }} id="purchase-file-upload" />
                  <label htmlFor="purchase-file-upload" style={{ display: 'inline-block', padding: '5px 12px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>Browse Files</label>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Payment Card */}
          <div className="new-invoice-card invoice-form-row-right summary-payment-combined-card">
            <div className="card-header">
              <span className="card-header-icon"><FiCreditCard /></span>
              <h2>{title.includes("Bill") ? "Bill Summary" : "Purchase Summary"}</h2>
            </div>
            <div className="card-body summary-rows-list" style={{ paddingBottom: '16px' }}>
              <div className="summary-calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="summary-label" style={{ color: '#64748b' }}>Subtotal</span>
                <span className="summary-value" style={{ fontWeight: '500' }}>{cur}{subTotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="summary-label" style={{ color: '#64748b' }}>Total Discount</span>
                <span className="summary-value discount-text-red" style={{ color: '#ef4444', fontWeight: '500' }}>-{cur}{totalDiscount.toFixed(2)}</span>
              </div>

              <div className="summary-calc-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="summary-label" style={{ color: '#64748b' }}>Total Tax</span>
                <span className="summary-value" style={{ fontWeight: '500' }}>{cur}{totalTax.toFixed(2)}</span>
              </div>

              <div className="summary-divider-line" style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }}></div>

              <div className="summary-grand-total-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="grand-total-label" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Total Amount</span>
                <span className="grand-total-value" style={{ fontSize: '18px', fontWeight: '700', color: '#7c3aed' }}>{cur}{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="card-body payment-fields-vertical" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
              <div className="amount-received-row" style={{ marginBottom: '12px' }}>
                <label className="required-field" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1e293b' }}>Payment Mode</label>
                <div className="amount-received-combined-group">
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', outline: 'none' }}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="amount-received-row" style={{ marginBottom: '16px' }}>
                <label className="required-field" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1e293b' }}>Status</label>
                <div className="amount-received-combined-group">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', outline: 'none' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
              </div>

              <div className="invoice-form-action-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-action-draft" onClick={onCancel} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-action-send-single" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiSave /> {submitText}
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>

      {showSettingsModal && (
        <div className="invoice-settings-popup-overlay">
          <div className="invoice-settings-popup">
            <h3>{title.includes("Bill") ? "Bill Form Settings" : title.includes("Order") ? "Purchase Order Settings" : "Purchase Form Settings"}</h3>
            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label>Currency Symbol</label>
              <input
                type="text"
                defaultValue={settings.currency || "₹"}
                id="popup-currency-input"
              />
            </div>
            <div className="form-group" style={{ marginBottom: "12px" }}>
              <label>Default GST Tax Rate (%)</label>
              <input
                type="number"
                defaultValue={settings.taxRate || 18}
                id="popup-taxrate-input"
              />
            </div>
            <div className="popup-actions" style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-header-secondary"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-header-primary-main"
                style={{ padding: "8px 16px", borderRadius: "6px" }}
                onClick={() => {
                  const curr = document.getElementById("popup-currency-input").value;
                  const rate = document.getElementById("popup-taxrate-input").value;
                  handleSaveSettings(curr, rate);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={showProductModal}
        initialName={addingProductRowIndex !== null ? items[addingProductRowIndex].product : ""}
        onClose={() => {
          setShowProductModal(false);
          setAddingProductRowIndex(null);
        }}
        onSave={(prod) => {
          const newProd = addProduct(prod);
          if (addingProductRowIndex !== null) {
            handleItemChange(addingProductRowIndex, "product", newProd.name);
            handleItemChange(addingProductRowIndex, "description", newProd.description || "");
            handleItemChange(addingProductRowIndex, "hsn", newProd.hsnSac || "");
            handleItemChange(addingProductRowIndex, "unit", newProd.unit || "Nos");
            handleItemChange(addingProductRowIndex, "price", newProd.purchasePrice || newProd.price || 0);
            if (newProd.gst !== undefined && newProd.gst !== null && newProd.gst !== "") {
              handleItemChange(addingProductRowIndex, "tax", newProd.gst);
            }
          }
          setShowProductModal(false);
          setAddingProductRowIndex(null);
        }}
      />
      <VendorModal
        isOpen={showNewVendorForm}
        onClose={() => setShowNewVendorForm(false)}
        initialName={formData.vendor}
        onSave={(newVendor) => {
          const created = addVendor(newVendor);
          handleSelectVendor(created);
        }}
      />
    </div>
  );
}

export default CreatePurchaseForm;
