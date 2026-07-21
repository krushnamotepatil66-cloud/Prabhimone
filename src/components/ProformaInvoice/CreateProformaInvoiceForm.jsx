import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import "../Invoice/CreateInvoiceForm.css";
import { 
  FiUser, 
  FiFileText, 
  FiPackage, 
  FiEdit3, 
  FiCreditCard, 
  FiSearch, 
  FiTrash2, 
  FiPlus, 
  FiCalendar, 
  FiSettings, 
  FiBell, 
  FiHelpCircle,
  FiChevronDown 
} from "react-icons/fi";

const defaultTermsAndConditions = `1. This proforma invoice is sent for approval before final billing.
2. Prices and rates listed are subject to terms of agreement.
3. Final tax invoice will be generated upon receipt of payment or approval.`;

const emptyForm = {
  customer: "",
  customerType: "Existing",
  mobileNumber: "",
  gstin: "",
  email: "",
  billingAddress: "",
  state: "Maharashtra",
  placeOfSupply: "Maharashtra",
  paymentTerms: "Due on Receipt",
  proformaId: "",
  date: new Date().toISOString().split("T")[0],
  expiryDate: new Date().toISOString().split("T")[0],
  salesPerson: "",
  referenceNo: "",
  items: [
    {
      product: "",
      description: "",
      hsn: "",
      qty: "1",
      unit: "Nos",
      price: "",
      discount: "",
      discountType: "Flat",
      tax: "18",
    }
  ],
  notes: "",
  internalNote: "",
  termsAndConditions: defaultTermsAndConditions,
};

function CreateProformaInvoiceForm({ editingProformaInvoice, onSave, onCancel }) {
  const { customers, proformaInvoices, addCustomer, settings } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isEditingParty, setIsEditingParty] = useState(false);
  const dropdownRef = useRef(null);

  // Additional calculation states
  const [additionalCharges, setAdditionalCharges] = useState("");
  const [autoRoundOff, setAutoRoundOff] = useState(true);
  const [status, setStatus] = useState("Draft");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [newCustomerData, setNewCustomerData] = useState({
    email: "",
    phone: "",
    company: "",
    city: "",
    address: ""
  });

  const handleNewCustomerDataChange = (field, value) => {
    setNewCustomerData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = (form.customer || "").toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term))
    );
  });

  // Load editing proforma invoice details if available
  useEffect(() => {
    if (editingProformaInvoice) {
      const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

      setForm({
        customer: editingProformaInvoice.customer,
        customerType: editingProformaInvoice.customerType || "Existing",
        mobileNumber: editingProformaInvoice.mobileNumber || "",
        gstin: editingProformaInvoice.gstin || "",
        email: editingProformaInvoice.email || "",
        billingAddress: editingProformaInvoice.billingAddress || "",
        state: editingProformaInvoice.state || "Maharashtra",
        placeOfSupply: editingProformaInvoice.placeOfSupply || "Maharashtra",
        paymentTerms: editingProformaInvoice.terms || "Due on Receipt",
        proformaId: editingProformaInvoice.id,
        date: editingProformaInvoice.date,
        expiryDate: editingProformaInvoice.expiryDate || editingProformaInvoice.date,
        salesPerson: editingProformaInvoice.salesPerson || "",
        referenceNo: editingProformaInvoice.referenceNo || "",
        items: editingProformaInvoice.items && editingProformaInvoice.items.length > 0
          ? editingProformaInvoice.items.map(item => ({
              product: item.product,
              description: item.description || "",
              hsn: item.hsn || "",
              qty: String(item.qty),
              unit: item.unit || "Nos",
              price: String(item.price),
              discount: String(item.discount || ""),
              discountType: item.discountType || "Flat",
              tax: String(item.tax !== undefined ? item.tax : 18)
            }))
          : [{ product: "Service Consultation Agreement", description: "", hsn: "", qty: "1", unit: "Nos", price: String(parseAmount(editingProformaInvoice.amount)), discount: "", discountType: "Flat", tax: "18" }],
        notes: editingProformaInvoice.notes || "",
        internalNote: editingProformaInvoice.internalNote || "",
        termsAndConditions: editingProformaInvoice.termsAndConditions || settings.proformaTermsAndConditions || defaultTermsAndConditions,
      });

      setAdditionalCharges(editingProformaInvoice.additionalCharges ? String(editingProformaInvoice.additionalCharges) : "");
      setAutoRoundOff(editingProformaInvoice.autoRoundOff !== undefined ? editingProformaInvoice.autoRoundOff : true);
      setStatus(editingProformaInvoice.status || "Draft");
      setIsEditingParty(false);
    } else {
      setForm({
        ...emptyForm,
        proformaId: "",
        date: new Date().toISOString().split("T")[0],
        expiryDate: new Date().toISOString().split("T")[0],
        termsAndConditions: settings.proformaTermsAndConditions || defaultTermsAndConditions,
      });
      setStatus("Draft");
      setIsEditingParty(true);
    }
  }, [editingProformaInvoice, proformaInvoices.length, settings.proformaTermsAndConditions]);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerTypeChange = (type) => {
    if (type === "Walk-in") {
      setForm((prev) => ({
        ...prev,
        customerType: type,
        customer: "",
        gstin: "",
        email: "",
        billingAddress: "",
      }));
      setShowDropdown(false);
      setIsEditingParty(false);
    } else {
      setForm((prev) => ({
        ...prev,
        customerType: type,
        customer: "",
        mobileNumber: "",
        gstin: "",
        email: "",
        billingAddress: "",
      }));
      setIsEditingParty(true);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;

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
        {
          product: "",
          description: "",
          hsn: "",
          qty: "1",
          unit: "Nos",
          price: "",
          discount: "",
          discountType: "Flat",
          tax: "18",
        },
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

  // Auto calculate expiry date when date or terms change
  useEffect(() => {
    if (!form.date || form.paymentTerms === "Custom") return;

    const baseDate = new Date(form.date);
    if (isNaN(baseDate.getTime())) return;

    let offsetDays = 0;
    switch (form.paymentTerms) {
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
      default:
        offsetDays = 0;
    }

    baseDate.setDate(baseDate.getDate() + offsetDays);
    const calculatedExpiryDate = baseDate.toISOString().split("T")[0];
    
    setForm((prev) => ({
      ...prev,
      expiryDate: calculatedExpiryDate,
    }));
  }, [form.date, form.paymentTerms]);

  const handleSaveSettings = (newCurrency, newTaxRate) => {
    if (settings) {
      settings.currency = newCurrency;
      settings.taxRate = Number(newTaxRate) || 18;
    }
    setShowSettingsModal(false);
  };

  // Math Calculations
  const calculateItemDiscount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const discVal = Number(item.discount) || 0;
    if (item.discountType === "%") {
      return (itemSub * discVal) / 100;
    }
    return discVal;
  };

  const calculateItemTaxableAmount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const disc = calculateItemDiscount(item);
    return Math.max(0, itemSub - disc);
  };

  const calculateItemTaxAmount = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxRate = Number(item.tax) || 0;
    return (taxable * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxAmt = calculateItemTaxAmount(item);
    return taxable + taxAmt;
  };

  let subtotal = form.items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  let totalItemDiscount = form.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  let totalTaxableAmount = form.items.reduce((sum, item) => sum + calculateItemTaxableAmount(item), 0);
  let totalTax = form.items.reduce((sum, item) => sum + calculateItemTaxAmount(item), 0);

  const charges = Number(additionalCharges) || 0;
  const tempGrandTotal = totalTaxableAmount + totalTax + charges;
  const roundedGrandTotal = Math.round(tempGrandTotal);
  let roundOffDifference = autoRoundOff ? Number((roundedGrandTotal - tempGrandTotal).toFixed(2)) : 0;
  let grandTotal = autoRoundOff ? roundedGrandTotal : tempGrandTotal;

  const handleSelectCustomer = (cust) => {
    setForm((prev) => ({
      ...prev,
      customer: cust.name,
      email: cust.email || "",
      mobileNumber: cust.phone || "",
      billingAddress: cust.address || "",
    }));
    setShowDropdown(false);
    setIsEditingParty(false);
  };

  const handleSubmitForm = (e) => {
    if (e) e.preventDefault();

    if (!form.customer) {
      alert("Please select a customer.");
      return;
    }
    if (form.items.some((item) => !item.product || Number(item.price) <= 0)) {
      alert("Please ensure all items have a description and pricing details.");
      return;
    }

    // Auto-create customer if they don't exist
    const customerExists = customers.some(
      (c) => c.name.trim().toLowerCase() === form.customer.trim().toLowerCase()
    );
    if (!customerExists && form.customer.trim()) {
      addCustomer({
        name: form.customer.trim(),
        email: form.email,
        phone: form.mobileNumber,
        company: form.customer,
        city: form.state,
        address: form.billingAddress,
      });
    }

    const formattedAmount = `₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    const savedProforma = {
      id: form.proformaId || `PI-${String(proformaInvoices.length + 1).padStart(3, "0")}`,
      customer: form.customer || "Walk-in Customer",
      customerType: form.customerType,
      mobileNumber: form.mobileNumber,
      gstin: form.gstin,
      email: form.email,
      billingAddress: form.billingAddress,
      state: form.state,
      placeOfSupply: form.placeOfSupply,
      terms: form.paymentTerms,
      date: form.date,
      expiryDate: form.expiryDate,
      salesPerson: form.salesPerson,
      referenceNo: form.referenceNo,
      items: form.items.map(item => ({
        product: item.product,
        description: item.description,
        hsn: item.hsn,
        qty: Number(item.qty) || 1,
        unit: item.unit || "Nos",
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
        discountType: item.discountType,
        tax: Number(item.tax) || 18
      })),
      notes: form.notes,
      internalNote: form.internalNote,
      termsAndConditions: form.termsAndConditions,
      additionalCharges: charges,
      autoRoundOff,
      amount: formattedAmount,
      status: status,
    };

    onSave(savedProforma);
  };

  return (
    <div className="new-invoice-page-container">
      {/* Top Breadcrumb and Actions Header */}
      <div className="new-invoice-header-row">
        <div className="new-invoice-header-left">
          <div className="breadcrumb-nav">
            <span>Home</span> &gt; <span>Proforma Invoices</span> &gt; <span className="active">Create</span>
          </div>
          <h1 className="new-invoice-page-title">{editingProformaInvoice ? `Edit Proforma (${form.proformaId})` : "Create Proforma Invoice"}</h1>
        </div>
        
        <div className="new-invoice-header-right">
          <button type="button" className="btn-header-secondary" onClick={onCancel}>
            Cancel
          </button>
          <div className="btn-group-primary">
            <button 
              type="button" 
              className="btn-header-primary-main"
              onClick={(e) => handleSubmitForm(e)}
            >
              Save Proforma
            </button>
            <button type="button" className="btn-header-primary-arrow" onClick={() => setShowSettingsModal(true)}>
              <FiSettings />
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitForm} className="new-invoice-grid-form">
        {/* Left Column */}
        <div className="new-invoice-left-col">
          
          {/* 1. Customer Details Card */}
          <div className="new-invoice-card">
            <div className="card-header">
              <span className="card-header-icon"><FiUser /></span>
              <h2>Customer Details</h2>
            </div>
            
            <div className="card-body">
              {/* Customer Type Radio Group */}
              <div className="form-row radio-group-row">
                <label className="field-label-inline">Customer Type</label>
                <div className="radio-options-flex">
                  {["Walk-in", "Existing", "Business"].map((type) => (
                    <label key={type} className={`radio-custom-label ${form.customerType === type ? "radio-active" : ""}`}>
                      <input 
                        type="radio" 
                        name="customerType" 
                        value={type}
                        checked={form.customerType === type}
                        onChange={() => handleCustomerTypeChange(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Walk-in Customer Layout */}
              {form.customerType === "Walk-in" && (
                <div className="customer-details-split-body">
                  <div className="customer-details-left-side">
                    <div className="form-group">
                      <label className="required-field">Customer Name</label>
                      <input 
                        type="text" 
                        value={form.customer}
                        onChange={(e) => handleInput("customer", e.target.value)}
                        placeholder="Customer Name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input 
                        type="text" 
                        value={form.mobileNumber}
                        onChange={(e) => handleInput("mobileNumber", e.target.value)}
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>

                  <div className="customer-details-right-side">
                    <div className="side-by-side-row">
                      <div className="form-group half-width">
                        <label className="required-field">State</label>
                        <select 
                          value={form.state}
                          onChange={(e) => handleInput("state", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>

                      <div className="form-group half-width">
                        <label className="required-field">Place of Supply</label>
                        <select 
                          value={form.placeOfSupply}
                          onChange={(e) => handleInput("placeOfSupply", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Payment Terms</label>
                      <select 
                        value={form.paymentTerms}
                        onChange={(e) => handleInput("paymentTerms", e.target.value)}
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Custom">Custom Date</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Customer Layout */}
              {form.customerType === "Existing" && (
                <div className="customer-details-split-body">
                  <div className="customer-details-left-side">
                    <div className="form-group" ref={dropdownRef}>
                      <label className="required-field">Customer Name</label>
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={form.customer}
                          onChange={(e) => {
                            handleInput("customer", e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          placeholder="Search existing customers..."
                          required
                        />
                        <span className="dropdown-caret-arrow"><FiChevronDown /></span>
                        
                        {showDropdown && (
                          <div className="autocomplete-suggestions">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((c) => (
                                <div 
                                  key={c.id} 
                                  className="suggestion-row"
                                  onClick={() => handleSelectCustomer(c)}
                                >
                                  <strong>{c.name}</strong>
                                  {c.company && <span className="subtext"> - {c.company}</span>}
                                </div>
                              ))
                            ) : (
                              <div 
                                className="suggestion-row create-option"
                                onClick={() => {
                                  setShowDropdown(false);
                                  setShowNewCustomerForm(true);
                                }}
                              >
                                + Add New Customer: "{form.customer}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="required-field">Mobile Number</label>
                      <input 
                        type="text" 
                        value={form.mobileNumber}
                        onChange={(e) => handleInput("mobileNumber", e.target.value)}
                        placeholder="+91 00000 00000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>GSTIN</label>
                      <input 
                        type="text" 
                        value={form.gstin}
                        onChange={(e) => handleInput("gstin", e.target.value)}
                        placeholder="27ABCDE1234F1Z5"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => handleInput("email", e.target.value)}
                        placeholder="customer@email.com"
                      />
                    </div>
                  </div>

                  <div className="customer-details-right-side">
                    <div className="form-group billing-address-textarea-group">
                      <label>Billing Address</label>
                      <textarea 
                        value={form.billingAddress}
                        onChange={(e) => handleInput("billingAddress", e.target.value)}
                        placeholder="Enter Billing Address"
                        rows="4"
                      />
                    </div>

                    <div className="side-by-side-row">
                      <div className="form-group half-width">
                        <label className="required-field">State</label>
                        <select 
                          value={form.state}
                          onChange={(e) => handleInput("state", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>

                      <div className="form-group half-width">
                        <label className="required-field">Place of Supply</label>
                        <select 
                          value={form.placeOfSupply}
                          onChange={(e) => handleInput("placeOfSupply", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Payment Terms</label>
                      <select 
                        value={form.paymentTerms}
                        onChange={(e) => handleInput("paymentTerms", e.target.value)}
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Custom">Custom Date</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Customer Layout */}
              {form.customerType === "Business" && (
                <div className="customer-details-split-body">
                  <div className="customer-details-left-side">
                    <div className="form-group" ref={dropdownRef}>
                      <label className="required-field">Business / Company Name</label>
                      <div className="autocomplete-input-wrapper">
                        <input 
                          type="text" 
                          value={form.customer}
                          onChange={(e) => {
                            handleInput("customer", e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          placeholder="Enter business or company name"
                          required
                        />
                        <span className="dropdown-caret-arrow"><FiChevronDown /></span>
                        
                        {showDropdown && (
                          <div className="autocomplete-suggestions">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((c) => (
                                <div 
                                  key={c.id} 
                                  className="suggestion-row"
                                  onClick={() => handleSelectCustomer(c)}
                                >
                                  <strong>{c.name}</strong>
                                  {c.company && <span className="subtext"> - {c.company}</span>}
                                </div>
                              ))
                            ) : (
                              <div 
                                className="suggestion-row create-option"
                                onClick={() => {
                                  setShowDropdown(false);
                                  setShowNewCustomerForm(true);
                                }}
                              >
                                + Add New Customer: "{form.customer}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="required-field">Mobile Number</label>
                      <input 
                        type="text" 
                        value={form.mobileNumber}
                        onChange={(e) => handleInput("mobileNumber", e.target.value)}
                        placeholder="+91 00000 00000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>GSTIN</label>
                      <input 
                        type="text" 
                        value={form.gstin}
                        onChange={(e) => handleInput("gstin", e.target.value)}
                        placeholder="27ABCDE1234F1Z5"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => handleInput("email", e.target.value)}
                        placeholder="business@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="customer-details-right-side">
                    <div className="form-group billing-address-textarea-group">
                      <label className="required-field">Billing Address</label>
                      <textarea 
                        value={form.billingAddress}
                        onChange={(e) => handleInput("billingAddress", e.target.value)}
                        placeholder="Registered business address"
                        rows="4"
                        required
                      />
                    </div>

                    <div className="side-by-side-row">
                      <div className="form-group half-width">
                        <label className="required-field">State</label>
                        <select 
                          value={form.state}
                          onChange={(e) => handleInput("state", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>

                      <div className="form-group half-width">
                        <label className="required-field">Place of Supply</label>
                        <select 
                          value={form.placeOfSupply}
                          onChange={(e) => handleInput("placeOfSupply", e.target.value)}
                        >
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Payment Terms</label>
                      <select 
                        value={form.paymentTerms}
                        onChange={(e) => handleInput("paymentTerms", e.target.value)}
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Custom">Custom Date</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Items Card */}
          <div className="new-invoice-card no-padding">
            <div className="card-header bordered-bottom padding-24">
              <div className="flex-header-row">
                <div className="card-title-flex">
                  <span className="card-header-icon"><FiPackage /></span>
                  <h2>Items</h2>
                </div>
                
                <div className="search-items-row">
                  <div className="search-bar-input-stack">
                    <span className="search-icon"><FiSearch /></span>
                    <input 
                      type="text" 
                      placeholder="Search items by name / SKU"
                    />
                    <span className="barcode-scanner-icon">📷</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-purple-outline"
                    onClick={addItemRow}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body no-padding-body">
              <div className="items-table-scroll-container">
                <table className="new-items-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>PRODUCT / SERVICE</th>
                      <th style={{ width: "20%" }}>DESCRIPTION</th>
                      <th style={{ width: "10%", textAlign: "center" }}>QTY</th>
                      <th style={{ width: "10%", textAlign: "center" }}>UNIT</th>
                      <th style={{ width: "12%", textAlign: "right" }}>RATE</th>
                      <th style={{ width: "10%", textAlign: "center" }}>TAX RATE</th>
                      <th style={{ width: "10%", textAlign: "right" }}>DISCOUNT</th>
                      <th style={{ width: "15%", textAlign: "right" }}>AMOUNT</th>
                      <th style={{ width: "5%", textAlign: "center" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, index) => {
                      const rowAmount = calculateItemTotal(item);
                      return (
                        <tr key={index}>
                          <td>
                            <input 
                              type="text"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, "product", e.target.value)}
                              placeholder="Product / Service name"
                              required
                            />
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              placeholder="Deliverable details..."
                            />
                          </td>
                          <td>
                            <input 
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                              className="align-center"
                              min="1"
                            />
                          </td>
                          <td>
                            <select 
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              className="align-center"
                            >
                              <option value="Nos">Nos</option>
                              <option value="Hrs">Hrs</option>
                              <option value="Days">Days</option>
                              <option value="Pcs">Pcs</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", e.target.value)}
                              className="align-right"
                              placeholder="0.00"
                              required
                            />
                          </td>
                          <td>
                            <select 
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                              className="align-center"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="text"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                              className="align-right"
                              placeholder="0"
                            />
                          </td>
                          <td className="align-right row-final-amount font-semibold">
                            ₹{rowAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button 
                              type="button" 
                              className="row-action-dots-btn"
                              onClick={() => removeItemRow(index)}
                              disabled={form.items.length === 1}
                              title="Delete Row"
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
              <div className="table-bottom-actions-row">
                <div className="action-buttons-flex">
                  <button type="button" className="btn-purple-outline" onClick={addItemRow}>
                    <FiPlus style={{ marginRight: "4px" }} /> Add Item
                  </button>
                </div>
                <div className="total-items-badge">
                  Total Items: <span className="font-semibold">{form.items.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Notes Card */}
          <div className="new-invoice-card">
            <div className="card-header">
              <span className="card-header-icon"><FiEdit3 /></span>
              <h2>Notes & Conditions</h2>
            </div>
            
            <div className="card-body">
              <div className="notes-split-row">
                <div className="form-group flex-1">
                  <label>Notes</label>
                  <textarea 
                    value={form.notes}
                    onChange={(e) => handleInput("notes", e.target.value)}
                    placeholder="Add notes shown on the PDF..."
                    rows="3"
                  />
                </div>
                
                <div className="form-group flex-1">
                  <label>Internal Note</label>
                  <textarea 
                    value={form.internalNote}
                    onChange={(e) => handleInput("internalNote", e.target.value)}
                    placeholder="For administrative records..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-group terms-textarea-stack" style={{ marginTop: "16px" }}>
                <label>Terms and Conditions</label>
                <textarea 
                  value={form.termsAndConditions}
                  onChange={(e) => handleInput("termsAndConditions", e.target.value)}
                  className="terms-conditions-display"
                  rows="4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="new-invoice-right-col">
          
          {/* 1. Proforma Details Card */}
          <div className="new-invoice-card">
            <div className="card-header">
              <span className="card-header-icon"><FiFileText /></span>
              <h2>Proforma Details</h2>
            </div>
            
            <div className="card-body flex-fields-vertical">
              <div className="form-group input-with-icon-group">
                <label className="required-field">Proforma Invoice Number</label>
                <div className="input-with-side-button">
                  <input 
                    type="text" 
                    value={form.proformaId}
                    onChange={(e) => handleInput("proformaId", e.target.value)}
                    placeholder="PI-000001"
                    disabled={editingProformaInvoice}
                  />
                  <button type="button" className="input-side-settings-btn" onClick={() => setShowSettingsModal(true)}>
                    <FiSettings />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="required-field">Proforma Date</label>
                <div className="input-with-inline-icon">
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => handleInput("date", e.target.value)}
                    required
                  />
                  <span className="inline-input-icon"><FiCalendar /></span>
                </div>
              </div>

              <div className="form-group">
                <label className="required-field">Expiry Date</label>
                <div className="input-with-inline-icon">
                  <input 
                    type="date" 
                    value={form.expiryDate}
                    onChange={(e) => handleInput("expiryDate", e.target.value)}
                    disabled={form.paymentTerms !== "Custom"}
                    required
                  />
                  <span className="inline-input-icon"><FiCalendar /></span>
                </div>
              </div>

              <div className="form-group">
                <label>Sales Person</label>
                <div className="autocomplete-input-wrapper">
                  <input 
                    type="text" 
                    value={form.salesPerson}
                    onChange={(e) => handleInput("salesPerson", e.target.value)}
                    placeholder="Enter sales person name"
                  />
                  <span className="dropdown-caret-arrow"><FiChevronDown /></span>
                </div>
              </div>

              <div className="form-group">
                <label>Reference No.</label>
                <input 
                  type="text" 
                  value={form.referenceNo}
                  onChange={(e) => handleInput("referenceNo", e.target.value)}
                  placeholder="e.g. PO-4587"
                />
              </div>
            </div>
          </div>

          {/* 2. Proforma Summary Card */}
          <div className="new-invoice-card">
            <div className="card-header">
              <span className="card-header-icon"><FiEdit3 /></span>
              <h2>Proforma Summary</h2>
            </div>
            
            <div className="card-body summary-rows-list">
              <div className="summary-calc-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              
              {totalItemDiscount > 0 && (
                <div className="summary-calc-row">
                  <span className="summary-label">Item Discount</span>
                  <span className="summary-value discount-text-red">- ₹{totalItemDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="summary-calc-row">
                <span className="summary-label">Taxable Amount</span>
                <span className="summary-value">₹{totalTaxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-calc-row">
                <span className="summary-label">Total GST ({(settings?.taxRate || 18)}%)</span>
                <span className="summary-value">₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-calc-row">
                <label className="checkbox-toggle-flex">
                  <input 
                    type="checkbox"
                    checked={autoRoundOff}
                    onChange={(e) => setAutoRoundOff(e.target.checked)}
                  />
                  <span>Round Off</span>
                </label>
                <span className="summary-value font-medium">
                  {roundOffDifference >= 0 ? `+ ₹${roundOffDifference.toFixed(2)}` : `- ₹${Math.abs(roundOffDifference).toFixed(2)}`}
                </span>
              </div>

              <div className="summary-divider-line"></div>

              <div className="summary-grand-total-row">
                <span className="grand-total-label">Grand Total</span>
                <span className="grand-total-value">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* 3. Proforma Status Card */}
          <div className="new-invoice-card">
            <div className="card-header">
              <span className="card-header-icon"><FiCreditCard /></span>
              <h2>Proforma Status</h2>
            </div>
            
            <div className="card-body payment-fields-vertical">
              <div className="form-group">
                <label className="required-field">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Invoiced">Invoiced / Finalized</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="balance-due-display-row" style={{ marginTop: "12px", marginBottom: "16px" }}>
                <span className="balance-label">Valid Until</span>
                <span className="balance-value-badge font-semibold" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                  {form.expiryDate}
                </span>
              </div>

              <button 
                type="submit" 
                className="btn-purple-primary-block-action"
                style={{ background: "#7c3aed" }}
              >
                Save Proforma &rarr;
              </button>
            </div>
          </div>

        </div>
      </form>

      {/* Settings Modal Popup Dialog */}
      {showSettingsModal && (
        <div className="invoice-settings-popup-overlay">
          <div className="invoice-settings-popup">
            <h3>Proforma Form Settings</h3>
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

      {/* Quick Customer Addition Inline Frame */}
      {showNewCustomerForm && (
        <div className="invoice-settings-popup-overlay">
          <div className="invoice-settings-popup customer-popup-large">
            <h3>Quick Add Customer</h3>
            
            <div className="quick-cust-form-fields">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text"
                  value={form.customer}
                  onChange={(e) => handleInput("customer", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => handleNewCustomerDataChange("email", e.target.value)}
                  placeholder="customer@email.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text"
                  value={newCustomerData.phone}
                  onChange={(e) => handleNewCustomerDataChange("phone", e.target.value)}
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text"
                  value={newCustomerData.company}
                  onChange={(e) => handleNewCustomerDataChange("company", e.target.value)}
                  placeholder="Company LLC"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input 
                  type="text"
                  value={newCustomerData.city}
                  onChange={(e) => handleNewCustomerDataChange("city", e.target.value)}
                  placeholder="Pune"
                />
              </div>

              <div className="form-group full-width-span">
                <label>Billing Address</label>
                <textarea 
                  value={newCustomerData.address}
                  onChange={(e) => handleNewCustomerDataChange("address", e.target.value)}
                  placeholder="123 Road, St."
                  rows="2"
                />
              </div>
            </div>

            <div className="popup-actions" style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-header-secondary"
                onClick={() => setShowNewCustomerForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-header-primary-main"
                style={{ padding: "8px 16px", borderRadius: "6px" }}
                onClick={() => {
                  handleSelectCustomer({
                    name: form.customer,
                    email: newCustomerData.email,
                    phone: newCustomerData.phone,
                    company: newCustomerData.company,
                    address: `${newCustomerData.address}, ${newCustomerData.city}`,
                  });
                  setShowNewCustomerForm(false);
                }}
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateProformaInvoiceForm;
