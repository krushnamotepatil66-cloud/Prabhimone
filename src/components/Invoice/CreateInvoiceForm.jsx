import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import CreateCustomerForm from "../Customer/CreateCustomerForm";
import CustomerModal from "../Customer/CustomerModal";
import ProductModal from "../Product/ProductModal";
import "./CreateInvoiceForm.css";
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

const defaultTermsAndConditions = `1. Goods once sold will not be taken back or exchanged
2. For warranty, retain cash memo
3. Please check breakage and damage against delivery
4. For order need to pay 50% advance amount
5. All disputes are subject to PUNE jurisdiction only`;

const emptyForm = {
  customer: "",
  customerType: "Customer",
  mobileNumber: "",
  gstin: "",
  email: "",
  billingAddress: "",
  shippingAddress: "",
  isShippingSameAsBilling: true,
  state: "Maharashtra",
  placeOfSupply: "Maharashtra",
  paymentTerms: "Custom",
  invoiceId: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date().toISOString().split("T")[0],
  salesPerson: "",
  referenceNo: "",
  items: [
    {
      product: "",
      description: "",
      hsn: "",
      qty: "",
      unit: "",
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

function CreateInvoiceForm({ editingInvoice, onSave, onCancel }) {
  const { customers, invoices, addCustomer, settings , products, addProduct } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isEditingParty, setIsEditingParty] = useState(false);
  const dropdownRef = useRef(null);

  const [activeProductDropdownIndex, setActiveProductDropdownIndex] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [addingProductRowIndex, setAddingProductRowIndex] = useState(null);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);

  // Additional calculation states
  const [additionalCharges, setAdditionalCharges] = useState("");
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [markAsFullyPaid, setMarkAsFullyPaid] = useState(false);
  const [isCashSaleDefault, setIsCashSaleDefault] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [newCustomerData, setNewCustomerData] = useState({
    email: "",
    phone: "+91",
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
      if (!event.target.closest('.product-dropdown-container')) {
        setActiveProductDropdownIndex(null);
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

  // Load editing invoice details if available
  useEffect(() => {
    if (editingInvoice) {
      const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

      setForm({
        customer: editingInvoice.customer,
        customerType: editingInvoice.customerType || "Customer",
        mobileNumber: editingInvoice.mobileNumber || "",
        gstin: editingInvoice.gstin || "",
        email: editingInvoice.email || "",
        billingAddress: editingInvoice.billingAddress || "",
        shippingAddress: editingInvoice.shippingAddress || "",
        isShippingSameAsBilling: editingInvoice.isShippingSameAsBilling !== undefined ? editingInvoice.isShippingSameAsBilling : (editingInvoice.shippingAddress ? editingInvoice.shippingAddress === editingInvoice.billingAddress : true),
        state: editingInvoice.state || "Maharashtra",
        placeOfSupply: editingInvoice.placeOfSupply || "Maharashtra",
        paymentTerms: editingInvoice.terms || "Custom",
        invoiceId: editingInvoice.id,
        date: editingInvoice.date,
        dueDate: editingInvoice.dueDate || editingInvoice.date,
        salesPerson: editingInvoice.salesPerson || "",
        referenceNo: editingInvoice.referenceNo || "",
        items: editingInvoice.items && editingInvoice.items.length > 0
          ? editingInvoice.items.map(item => ({
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
          : [{ product: "Service Charges", description: "", hsn: "", qty: "", unit: "Nos", price: String(parseAmount(editingInvoice.amount)), discount: "", discountType: "Flat", tax: "18" }],
        notes: editingInvoice.notes || "",
        internalNote: editingInvoice.internalNote || "",
        termsAndConditions: editingInvoice.termsAndConditions || settings.invoiceTermsAndConditions || defaultTermsAndConditions,
      });

      setAdditionalCharges(editingInvoice.additionalCharges ? String(editingInvoice.additionalCharges) : "");
      setAutoRoundOff(editingInvoice.autoRoundOff !== undefined ? editingInvoice.autoRoundOff : false);
      setAmountReceived(editingInvoice.amountReceived ? String(editingInvoice.amountReceived) : "");
      setPaymentMode(editingInvoice.paymentMode || "UPI");
      setMarkAsFullyPaid(editingInvoice.status === "Paid");
      setIsEditingParty(false);
    } else {
      let nextInvoiceId = "";
      if (settings.invoiceAutoNumber !== false) {
        const prefix = settings.invoicePrefix || "INV-";
        const matching = invoices.filter(inv => (inv.id || "").startsWith(prefix));
        if (matching.length > 0) {
          const numbers = matching.map(inv => parseInt((inv.id || "").slice(prefix.length), 10) || 0);
          nextInvoiceId = `${prefix}${String(Math.max(...numbers) + 1).padStart(3, "0")}`;
        } else {
          nextInvoiceId = `${prefix}001`;
        }
      }

      setForm({
        ...emptyForm,
        invoiceId: nextInvoiceId,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        termsAndConditions: settings.invoiceTermsAndConditions || defaultTermsAndConditions,
      });
      setAmountReceived("");
      setPaymentMode("UPI");
      setMarkAsFullyPaid(false);
      setIsEditingParty(true);
    }
  }, [editingInvoice, invoices, settings]);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerTypeChange = (type) => {
    if (type === "Customer") {
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
      setIsCashSaleDefault(false);
    } else if (type === "Business") {
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
      setIsCashSaleDefault(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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
          qty: "",
          unit: "",
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

  // Auto calculate due date when date or terms change
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
    const calculatedDueDate = baseDate.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      dueDate: calculatedDueDate,
    }));
  }, [form.date, form.paymentTerms]);

  const handleSaveSettings = (newCurrency, newTaxRate) => {
    if (settings) {
      settings.currency = newCurrency;
      settings.taxRate = Number(newTaxRate) || 18;
    }
    setShowSettingsModal(false);
  };

  // Safe number parser
  const parseNum = (val) => Number(String(val || 0).replace(/[^0-9.-]/g, "")) || 0;

  // Math Calculations
  const calculateItemDiscount = (item) => {
    const qty = parseNum(item.qty);
    const price = parseNum(item.price);
    const itemSub = qty * price;
    const discVal = parseNum(item.discount);
    if (item.discountType === "%") {
      return (itemSub * discVal) / 100;
    }
    return discVal;
  };

  const calculateItemTaxableAmount = (item) => {
    const qty = parseNum(item.qty);
    const price = parseNum(item.price);
    const itemSub = qty * price;
    const disc = calculateItemDiscount(item);
    return Math.max(0, itemSub - disc);
  };

  const calculateItemTaxAmount = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxRate = parseNum(item.tax);
    return (taxable * taxRate) / 100;
  };

  const calculateItemTotal = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxAmt = calculateItemTaxAmount(item);
    return taxable + taxAmt;
  };

  let subtotal = form.items.reduce((sum, item) => sum + parseNum(item.qty) * parseNum(item.price), 0);
  let totalItemDiscount = form.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  let totalTaxableAmount = form.items.reduce((sum, item) => sum + calculateItemTaxableAmount(item), 0);
  let totalTax = form.items.reduce((sum, item) => sum + calculateItemTaxAmount(item), 0);

  const charges = Number(additionalCharges) || 0;
  const tempGrandTotal = totalTaxableAmount + totalTax + charges;
  const roundedGrandTotal = Math.round(tempGrandTotal);
  let roundOffDifference = autoRoundOff ? Number((roundedGrandTotal - tempGrandTotal).toFixed(2)) : 0;
  let grandTotal = autoRoundOff ? roundedGrandTotal : tempGrandTotal;

  // Fully paid listener
  useEffect(() => {
    if (markAsFullyPaid) {
      setAmountReceived(String(grandTotal));
    }
  }, [markAsFullyPaid, grandTotal]);

  const getItemAmountForDisplay = (item, index) => {
    return calculateItemTotal(item);
  };

  const handleSelectCustomer = (c) => {
    setForm((prev) => ({
      ...prev,
      customer: c.name,
      email: c.email || prev.email,
      mobileNumber: c.phone || prev.mobileNumber,
      billingAddress: c.address || prev.billingAddress,
      gstin: c.gstin || "",
    }));
    setShowDropdown(false);
    setShowNewCustomerForm(false);
    setIsEditingParty(false);
    setIsCashSaleDefault(false);
  };

  const handleSubmitForm = (e, forceStatus, shouldPrint = false) => {
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

    const paidVal = Number(amountReceived) || 0;

    // Auto-generate invoice id if left blank
    const finalInvoiceId = form.invoiceId.trim() || `INV-${String(invoices.length + 1).padStart(3, "0")}`;

    const savedInvoiceData = {
      id: finalInvoiceId,
      customer: form.customer.trim(),
      date: form.date,
      terms: form.paymentTerms,
      dueDate: form.dueDate,
      status: forceStatus || (markAsFullyPaid || paidVal >= grandTotal ? "Paid" : (editingInvoice && editingInvoice.status !== "Paid" ? editingInvoice.status : "Pending")),
      amount: `${settings.currency || "₹"}${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      grandTotal: grandTotal,
      subtotal: subtotal,
      totalTaxableAmount: totalTaxableAmount,
      totalTax: totalTax,
      items: form.items.map(item => ({
        product: item.product,
        description: item.description,
        hsn: item.hsn,
        qty: Number(item.qty) || 1,
        unit: item.unit || "Nos",
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
        discountType: item.discountType,
        tax: item.tax !== "" && !isNaN(Number(item.tax)) ? Number(item.tax) : 0
      })),
      discount: Number(totalItemDiscount),
      discountType: "Flat",
      adjustment: Number(roundOffDifference),
      notes: form.notes,
      internalNote: form.internalNote,
      termsAndConditions: form.termsAndConditions,
      additionalCharges: charges,
      autoRoundOff,
      amountReceived: paidVal,
      paymentMode,
      balanceDue: Math.max(0, grandTotal - paidVal),
      customerType: form.customerType,
      mobileNumber: form.mobileNumber,
      gstin: form.gstin,
      email: form.email,
      billingAddress: form.billingAddress,
      shippingAddress: form.isShippingSameAsBilling ? form.billingAddress : form.shippingAddress,
      isShippingSameAsBilling: form.isShippingSameAsBilling,
      state: form.state,
      placeOfSupply: form.placeOfSupply,
      salesPerson: form.salesPerson,
      referenceNo: form.referenceNo,
    };

    onSave(savedInvoiceData, shouldPrint);
  };

  const finalAmountPaid = Number(amountReceived) || 0;

  return (
    <div className="new-invoice-page-container">
      {/* Top Breadcrumb and Actions Header */}
      <div className="new-invoice-header-row">
        <div className="new-invoice-header-left">
          <div className="breadcrumb-nav">
            <span>Home</span> &gt; <span>Invoices</span> &gt; <span className="active">Create</span>
          </div>
          <h1 className="new-invoice-page-title">Create Invoice</h1>
        </div>

        <div className="new-invoice-header-right">
        </div>
      </div>

      <form onSubmit={(e) => handleSubmitForm(e)} className="new-invoice-form-layout">

        {/* â•â•â•â•â•â•â• ROW 1: Customer Details (left) + Invoice Details (right) â•â•â•â•â•â•â• */}
        <div className="invoice-form-row invoice-form-row-top">
          {/* Customer Details Card */}
          <div className="new-invoice-card invoice-form-row-left">
            <div className="card-header">
              <span className="card-header-icon"><FiUser /></span>
              <h2>Customer Details</h2>
            </div>

            <div className="card-body">
              {/* Customer Type Radio Group */}
              <div className="form-row radio-group-row">
                <label className="field-label-inline">Customer Type</label>
                <div className="radio-options-flex">
                  {["Customer", "Business"].map((type) => (
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

              {/* â•â•â• Customer Layout â•â•â• */}
              {form.customerType === "Customer" && (
                <div className="customer-details-block-layout">
                  {/* Row 1: Customer Name + Mobile Number (left) & Billing Address (right) */}
                  <div className="details-section-row">
                    <div className="details-left-col">
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const exactMatch = filteredCustomers.find(
                                  (c) => c.name.trim().toLowerCase() === form.customer.trim().toLowerCase()
                                );
                                if (exactMatch) {
                                  handleSelectCustomer(exactMatch);
                                } else {
                                  setShowNewCustomerForm(true);
                                  setShowDropdown(false);
                                }
                              }
                            }}
                            placeholder="Search customers..."
                            required
                          />
                          <span className="dropdown-caret-arrow"><FiChevronDown /></span>

                          {showDropdown && (
                            <div className="autocomplete-suggestions">
                              {filteredCustomers.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="suggestion-row"
                                  onClick={() => handleSelectCustomer(c)}
                                >
                                  <div>{c.name}</div>
                                  {c.email && <div className="subtext">{c.email}</div>}
                                </div>
                              ))}
                              <div
                                className="suggestion-row create-option"
                                onClick={() => setShowNewCustomerForm(true)}
                              >
                                + Create New Customer
                              </div>
                            </div>
                          )}
                        </div>
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

                    <div className="details-right-col">
                      <div className="form-group">
                        <label>Billing Address</label>
                        <textarea
                          value={form.billingAddress}
                          onChange={(e) => handleInput("billingAddress", e.target.value)}
                          placeholder="Enter Billing Address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: GSTIN + Email (left) & Shipping Address (right) */}
                  <div className="details-section-row">
                    <div className="details-left-col">
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

                    <div className="details-right-col">
                      <div className="form-group shipping-address-textarea-group">
                        <label>Shipping Address</label>
                        <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "normal", marginBottom: form.isShippingSameAsBilling ? "0px" : "6px", color: "var(--text-grey)" }}>
                          <input
                            type="checkbox"
                            checked={form.isShippingSameAsBilling}
                            onChange={(e) => {
                              handleInput("isShippingSameAsBilling", e.target.checked);
                              if (e.target.checked) {
                                handleInput("shippingAddress", form.billingAddress);
                              }
                            }}
                          />
                          Same as Billing Address
                        </label>
                        {!form.isShippingSameAsBilling && (
                          <textarea
                            value={form.shippingAddress}
                            onChange={(e) => handleInput("shippingAddress", e.target.value)}
                            placeholder="Enter Shipping Address"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* â•â•â• Business Layout â•â•â• */}
              {form.customerType === "Business" && (
                <div className="customer-details-block-layout">
                  <div className="details-section-row">
                    <div className="details-left-col">
                      <div className="form-group" ref={dropdownRef}>
                        <label className="required-field">Business Name</label>
                        <div className="autocomplete-input-wrapper">
                          <input
                            type="text"
                            value={form.customer}
                            onChange={(e) => {
                              handleInput("customer", e.target.value);
                              setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const exactMatch = filteredCustomers.find(
                                  (c) => c.name.trim().toLowerCase() === form.customer.trim().toLowerCase()
                                );
                                if (exactMatch) {
                                  handleSelectCustomer(exactMatch);
                                } else {
                                  setShowNewCustomerForm(true);
                                  setShowDropdown(false);
                                }
                              }
                            }}
                            placeholder="Search businesses..."
                            required
                          />
                          <span className="dropdown-caret-arrow"><FiChevronDown /></span>

                          {showDropdown && (
                            <div className="autocomplete-suggestions">
                              {filteredCustomers.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="suggestion-row"
                                  onClick={() => handleSelectCustomer(c)}
                                >
                                  <div>{c.name}</div>
                                  {c.email && <div className="subtext">{c.email}</div>}
                                </div>
                              ))}
                              <div
                                className="suggestion-row create-option"
                                onClick={() => setShowNewCustomerForm(true)}
                              >
                                + Create New Business
                              </div>
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
                    </div>

                    <div className="details-right-col">
                      <div className="form-group">
                        <label className="required-field">Billing Address</label>
                        <textarea
                          value={form.billingAddress}
                          onChange={(e) => handleInput("billingAddress", e.target.value)}
                          placeholder="Registered business address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="details-section-row">
                    <div className="details-left-col">
                      <div className="form-group">
                        <label className="required-field">GSTIN</label>
                        <input
                          type="text"
                          value={form.gstin}
                          onChange={(e) => handleInput("gstin", e.target.value)}
                          placeholder="27ABCDE1234F1Z5"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="required-field">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInput("email", e.target.value)}
                          placeholder="business@company.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="details-right-col">
                      <div className="form-group shipping-address-textarea-group">
                        <label className={form.isShippingSameAsBilling ? "" : "required-field"}>Shipping Address</label>
                        <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "normal", marginBottom: form.isShippingSameAsBilling ? "0px" : "6px", color: "var(--text-grey)" }}>
                          <input
                            type="checkbox"
                            checked={form.isShippingSameAsBilling}
                            onChange={(e) => {
                              handleInput("isShippingSameAsBilling", e.target.checked);
                              if (e.target.checked) {
                                handleInput("shippingAddress", form.billingAddress);
                              }
                            }}
                          />
                          Same as Billing Address
                        </label>
                        {!form.isShippingSameAsBilling && (
                          <textarea
                            value={form.shippingAddress}
                            onChange={(e) => handleInput("shippingAddress", e.target.value)}
                            placeholder="Registered shipping address"
                            required={!form.isShippingSameAsBilling}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details Card */}
          <div className="new-invoice-card invoice-details-compact-card invoice-form-row-right">
            <div className="card-header">
              <span className="card-header-icon"><FiFileText /></span>
              <h2>Invoice Details</h2>
            </div>

            <div className="card-body flex-fields-vertical">
              <div className="form-group input-with-icon-group">
                <label className="required-field">Invoice Number</label>
                <div className="input-with-side-button">
                  <input
                    type="text"
                    value={form.invoiceId}
                    onChange={(e) => handleInput("invoiceId", e.target.value)}
                    placeholder="INV-000001"
                  />
                  <button type="button" className="input-side-settings-btn" onClick={() => setShowSettingsModal(true)}>
                    <FiSettings />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="required-field">Invoice Date</label>
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
                <label className="required-field">Due Date</label>
                <div className="input-with-inline-icon">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => handleInput("dueDate", e.target.value)}
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
        </div>

        {/* â•â•â•â•â•â•â• ROW 2: Items Table (full width) â•â•â•â•â•â•â• */}
        <div className="invoice-form-row-full">
          <div className="new-invoice-card no-padding">
            <div className="card-header bordered-bottom padding-24">
              <div className="flex-header-row">
                <div className="card-title-flex">
                  <span className="card-header-icon"><FiPackage /></span>
                  <h2>Items</h2>
                </div>

                
              </div>
            </div>

            <div className="card-body no-padding">
              <div className="responsive-table-container">
                <table className="new-items-grid-table">
                  <thead>
                    <tr>
                      <th width="3%" className="align-center">#</th>
                      <th width="21%">Item Name</th>
                      <th width="8%">HSN / SAC</th>
                      <th width="8%" className="align-center">Qty</th>
                      <th width="8%" className="align-center">Unit</th>
                      <th width="8%" className="align-right">Price (₹)</th>
                      <th width="8%" className="align-center">GST %</th>
                      <th width="11%" className="align-right">Discount</th>
                      <th width="14%" className="align-right">Amount (₹)</th>
                      <th width="4%" className="align-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, index) => {
                      const rowAmount = getItemAmountForDisplay(item, index);
                      return (
                        <tr key={index}>
                          <td className="row-counter">{index + 1}</td>
                          <td>
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
                                        handleItemChange(index, "hsn", p.hsnSac || "");
                                        handleItemChange(index, "unit", p.unit || "Nos");
                                        
                                        let finalPrice = Number(p.price) || 0;
                                        if (p.salesTaxType === "With Tax") {
                                          const tRate = Number(p.tax) || 0;
                                          finalPrice = finalPrice / (1 + (tRate / 100));
                                          finalPrice = Number(finalPrice.toFixed(2));
                                        }
                                        handleItemChange(index, "price", finalPrice);
                                        
                                        if (p.tax !== undefined && p.tax !== null && p.tax !== "") {
                                          handleItemChange(index, "tax", p.tax);
                                        }
                                        if (p.discountOnSales !== undefined && p.discountOnSales !== null && p.discountOnSales !== "") {
                                          handleItemChange(index, "discount", p.discountOnSales);
                                          handleItemChange(index, "discountType", p.discountType || "Flat");
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
                                  required
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
                                            handleItemChange(index, "hsn", p.hsnSac || "");
                                            handleItemChange(index, "unit", p.unit || "Nos");
                                            
                                            let finalPrice = Number(p.price) || 0;
                                            if (p.salesTaxType === "With Tax") {
                                              const tRate = Number(p.tax) || 0;
                                              finalPrice = finalPrice / (1 + (tRate / 100));
                                              finalPrice = Number(finalPrice.toFixed(2));
                                            }
                                            handleItemChange(index, "price", finalPrice);
                                            
                                            if (p.tax !== undefined && p.tax !== null && p.tax !== "") {
                                              handleItemChange(index, "tax", p.tax);
                                            }
                                            if (p.discountOnSales !== undefined && p.discountOnSales !== null && p.discountOnSales !== "") {
                                              handleItemChange(index, "discount", p.discountOnSales);
                                              handleItemChange(index, "discountType", p.discountType || "Flat");
                                            }
                                            setActiveProductDropdownIndex(null);
                                          }}
                                        >
                                          <div>{p.name}</div>
                                          {p.price && <div className="subtext">₹{Number(p.price).toLocaleString()}</div>}
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
                              placeholder="HSN code"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                              className="align-center"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              placeholder="Nos"
                              className="align-center"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", e.target.value)}
                              className="align-right"
                              required
                            />
                          </td>
                          <td>
                            <div className="gst-input-wrapper">
                              <input
                                type="number"
                                value={item.tax}
                                onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                                placeholder="0"
                                className="align-center gst-input"
                                min="0"
                                max="100"
                                step="any"
                              />
                              <span className="gst-percent-badge">%</span>
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
        </div>

        {/* â•â•â•â•â•â•â• ROW 3: Notes (left) + Summary & Payment (right) â•â•â•â•â•â•â• */}
        <div className="invoice-form-row invoice-form-row-bottom">
          {/* Notes Card */}
          <div className="new-invoice-card invoice-form-row-left">
            <div className="card-header">
              <span className="card-header-icon"><FiEdit3 /></span>
              <h2>Notes</h2>
            </div>

            <div className="card-body">
              <div className="notes-split-row">
                <div className="form-group flex-1">
                  <label>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleInput("notes", e.target.value)}
                    placeholder="Add any notes or special instructions..."
                    rows="3"
                    style={{ resize: "none" }}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Internal Note</label>
                  <textarea
                    value={form.internalNote}
                    onChange={(e) => handleInput("internalNote", e.target.value)}
                    placeholder="For internal use only..."
                    rows="3"
                    style={{ resize: "none" }}
                  />
                </div>
              </div>

              <div className="form-group terms-textarea-stack" style={{ marginTop: "16px" }}>
                <label>Terms and Conditions</label>
                <textarea
                  value={form.termsAndConditions}
                  onChange={(e) => handleInput("termsAndConditions", e.target.value)}
                  className="terms-conditions-display"
                  rows="8"
                  style={{ resize: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Combined Invoice Summary + Payment Details Card */}
          <div className="new-invoice-card invoice-form-row-right summary-payment-combined-card">
            {/* Invoice Summary Section */}
            <div className="card-header">
              <span className="card-header-icon"><FiEdit3 /></span>
              <h2>Invoice Summary</h2>
            </div>

            <div className="card-body summary-rows-list">
              <div className="summary-calc-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-calc-row">
                <span className="summary-label">Item Discount</span>
                <span className="summary-value discount-text-red">- ₹{totalItemDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-calc-row">
                <span className="summary-label">Taxable Amount</span>
                <span className="summary-value">₹{totalTaxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-calc-row">
                <span className="summary-label">Total GST</span>
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
                <span className="summary-value font-semibold">
                  {roundOffDifference >= 0 ? `+ ₹${roundOffDifference.toFixed(2)}` : `- ₹${Math.abs(roundOffDifference).toFixed(2)}`}
                </span>
              </div>

              <div className="summary-divider-line"></div>

              <div className="summary-grand-total-row">
                <span className="grand-total-label">Grand Total</span>
                <span className="grand-total-value">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="card-body payment-fields-vertical">
              <div className="fully-paid-checkbox-row">
                <label className="checkbox-toggle-flex-end">
                  <span>Mark as fully paid</span>
                  <input
                    type="checkbox"
                    checked={markAsFullyPaid}
                    onChange={(e) => {
                      setMarkAsFullyPaid(e.target.checked);
                      if (e.target.checked) {
                        setAmountReceived(String(grandTotal));
                      }
                    }}
                  />
                </label>
              </div>

              <div className="amount-received-row">
                <label className="required-field">Amount Received</label>
                <div className="amount-received-combined-group">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="text"
                    value={amountReceived}
                    onChange={(e) => {
                      setAmountReceived(e.target.value);
                      if (Number(e.target.value) < grandTotal) {
                        setMarkAsFullyPaid(false);
                      }
                    }}
                    placeholder="0"
                    disabled={markAsFullyPaid}
                    required
                  />
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="balance-due-display-row">
                <span className="balance-label">Balance Due</span>
                <span className="balance-value-badge font-semibold">
                  ₹{Math.max(0, grandTotal - finalAmountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="invoice-form-action-buttons">
                <button type="button" className="btn-action-draft" onClick={() => onCancel && onCancel()}>
                  Cancel
                </button>
                <button type="button" className="btn-action-preview" onClick={(e) => handleSubmitForm(e, null, false)}>
                  Save &amp; Preview
                </button>
                <button
                  type="button"
                  className="btn-action-send-single"
                  onClick={(e) => handleSubmitForm(e, null, true)}
                >
                  Save &amp; Print
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* Settings Modal Popup Dialog */}
      {showSettingsModal && (
        <div className="invoice-settings-popup-overlay">
          <div className="invoice-settings-popup">
            <h3>Invoice Form Settings</h3>
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
      <CustomerModal
        isOpen={showNewCustomerForm}
        onClose={() => setShowNewCustomerForm(false)}
        initialName={form.customer}
        onSave={(newCust) => {
          if (addCustomer) addCustomer(newCust);
          handleSelectCustomer({
            name: newCust.name,
            email: newCust.email,
            phone: newCust.phone,
            company: newCust.company,
            address: newCust.address,
            gstin: newCust.gstin,
            state: newCust.state,
            city: newCust.city,
            pincode: newCust.pincode,
          });
          setShowNewCustomerForm(false);
        }}
      />
      <ProductModal
        isOpen={showProductModal}
        initialName={addingProductRowIndex !== null ? form.items[addingProductRowIndex].product : ""}
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
            handleItemChange(addingProductRowIndex, "price", newProd.price || 0);
            if (newProd.tax !== undefined && newProd.tax !== null && newProd.tax !== "") {
              handleItemChange(addingProductRowIndex, "tax", newProd.tax);
            }
            if (newProd.discountOnSales !== undefined && newProd.discountOnSales !== null && newProd.discountOnSales !== "") {
              handleItemChange(addingProductRowIndex, "discount", newProd.discountOnSales);
            }
          }
          setShowProductModal(false);
          setAddingProductRowIndex(null);
        }}
      />
    </div>
  );
}

export default CreateInvoiceForm;
