import { useState, useEffect } from "react";
import "./CreateCustomerForm.css";

const emptyForm = {
  contactType: "Customer",
  salutation: "Mr.",
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "+91 ",
  workPhone: "",
  website: "",
  gstTreatment: "Consumer",
  gstin: "",
  pan: "",
  placeOfSupply: "Maharashtra",
  currency: "INR",
  paymentTerms: "Due on Receipt",
  address: "",
  city: "",
  shippingAddress: "",
  shippingCity: "",
  notes: "",
};

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Haryana",
  "Punjab",
  "Kerala",
  "Rajasthan",
];

function CreateCustomerForm({ editingCustomer, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [activeAddressTab, setActiveAddressTab] = useState("billing");

  useEffect(() => {
    if (editingCustomer) {
      // Split full name into first and last name for editing inputs
      const names = (editingCustomer.name || "").trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      setForm({
        ...emptyForm,
        ...editingCustomer,
        firstName,
        lastName,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingCustomer]);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const copyBillingAddress = () => {
    setForm((prev) => ({
      ...prev,
      shippingAddress: prev.address,
      shippingCity: prev.city,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email) {
      alert("Please fill in the required fields (First Name and Email).");
      return;
    }

    // Join name fields for internal storage compatibility
    const joinedName = `${form.firstName} ${form.lastName}`.trim();
    onSave({
      ...form,
      name: joinedName,
    });
  };

  return (
    <div className="zoho-customer-form-container">
      {/* Header */}
      <div className="form-page-header">
        <h2>{editingCustomer ? `Edit Contact` : "New Contact / Customer"}</h2>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="zoho-billing-form">
        
        {/* Contact Type Choice */}
        <div className="form-section-card">
          <h3 className="section-card-title">Contact Type</h3>
          <div className="contact-type-radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="contactType"
                value="Customer"
                checked={form.contactType === "Customer"}
                onChange={(e) => handleInput("contactType", e.target.value)}
              />
              <span>Customer</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="contactType"
                value="Vendor"
                checked={form.contactType === "Vendor"}
                onChange={(e) => handleInput("contactType", e.target.value)}
              />
              <span>Vendor</span>
            </label>
          </div>
        </div>

        {/* Primary Contact Details */}
        <div className="form-section-card">
          <h3 className="section-card-title">Primary Contact</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group name-split-field">
              <label className="required-label">Primary Contact Name</label>
              <div className="name-inputs-row">
                <select
                  value={form.salutation}
                  onChange={(e) => handleInput("salutation", e.target.value)}
                  className="form-input-control salutation-select"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => handleInput("firstName", e.target.value)}
                  required
                  className="form-input-control flex-1"
                />
                
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => handleInput("lastName", e.target.value)}
                  className="form-input-control flex-1"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label>Company Name</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleInput("company", e.target.value)}
                className="form-input-control"
                placeholder="e.g. Sharma Tech Solutions"
              />
            </div>

            <div className="form-field-group">
              <label className="required-label">Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInput("email", e.target.value)}
                required
                className="form-input-control"
                placeholder="e.g. rahul@company.com"
              />
            </div>

            <div className="form-field-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleInput("phone", e.target.value)}
                className="form-input-control"
                placeholder="Mobile phone"
              />
            </div>

            <div className="form-field-group">
              <label>Work Phone</label>
              <input
                type="text"
                value={form.workPhone}
                onChange={(e) => handleInput("workPhone", e.target.value)}
                className="form-input-control"
                placeholder="Office phone"
              />
            </div>

            <div className="form-field-group">
              <label>Website</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => handleInput("website", e.target.value)}
                className="form-input-control"
                placeholder="e.g. https://www.company.com"
              />
            </div>
          </div>
        </div>

        {/* Tax and Tax Registration Details (GST Settings) */}
        <div className="form-section-card">
          <h3 className="section-card-title">Tax and GST Details</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label>GST Treatment</label>
              <select
                value={form.gstTreatment}
                onChange={(e) => handleInput("gstTreatment", e.target.value)}
                className="form-input-control"
              >
                <option value="Consumer">GST Unregistered - Consumer</option>
                <option value="Registered">GST Registered - Regular Business</option>
                <option value="Unregistered">GST Unregistered - Business</option>
              </select>
            </div>

            <div className="form-field-group">
              <label>Place of Supply (State)</label>
              <select
                value={form.placeOfSupply}
                onChange={(e) => handleInput("placeOfSupply", e.target.value)}
                className="form-input-control"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic fields shown only for Registered Treatment */}
            {form.gstTreatment === "Registered" && (
              <>
                <div className="form-field-group">
                  <label className="required-label">GSTIN</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => handleInput("gstin", e.target.value)}
                    required
                    className="form-input-control"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                  />
                </div>
                <div className="form-field-group">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    value={form.pan}
                    onChange={(e) => handleInput("pan", e.target.value)}
                    className="form-input-control"
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Currencies and Due Terms Settings */}
        <div className="form-section-card">
          <h3 className="section-card-title">Financial Preferences</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => handleInput("currency", e.target.value)}
                className="form-input-control"
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
              </select>
            </div>

            <div className="form-field-group">
              <label>Payment Terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => handleInput("paymentTerms", e.target.value)}
                className="form-input-control"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Tabs Layout */}
        <div className="form-section-card">
          <div className="address-tabs-header">
            <button
              type="button"
              className={`address-tab-btn ${activeAddressTab === "billing" ? "active" : ""}`}
              onClick={() => setActiveAddressTab("billing")}
            >
              Billing Address
            </button>
            <button
              type="button"
              className={`address-tab-btn ${activeAddressTab === "shipping" ? "active" : ""}`}
              onClick={() => setActiveAddressTab("shipping")}
            >
              Shipping Address
            </button>
          </div>

          <div className="address-tab-content" style={{ marginTop: "16px" }}>
            {activeAddressTab === "billing" ? (
              <div className="customer-fields-grid">
                <div className="form-field-group" style={{ gridColumn: "span 2" }}>
                  <label>Billing Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleInput("address", e.target.value)}
                    className="form-input-control"
                    placeholder="e.g. 404 Main St, Bandra East"
                  />
                </div>
                <div className="form-field-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleInput("city", e.target.value)}
                    className="form-input-control"
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="copy-billing-container">
                  <button
                    type="button"
                    className="copy-billing-btn"
                    onClick={copyBillingAddress}
                  >
                    🔗 Copy Billing Address
                  </button>
                </div>
                
                <div className="customer-fields-grid" style={{ marginTop: "12px" }}>
                  <div className="form-field-group" style={{ gridColumn: "span 2" }}>
                    <label>Shipping Address</label>
                    <input
                      type="text"
                      value={form.shippingAddress}
                      onChange={(e) => handleInput("shippingAddress", e.target.value)}
                      className="form-input-control"
                      placeholder="e.g. 404 Main St, Bandra East"
                    />
                  </div>
                  <div className="form-field-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={form.shippingCity}
                      onChange={(e) => handleInput("shippingCity", e.target.value)}
                      className="form-input-control"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remarks / Internal Notes */}
        <div className="form-section-card">
          <h3 className="section-card-title">Remarks</h3>
          <div className="form-field-group">
            <label>Internal Remarks / Notes</label>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) => handleInput("notes", e.target.value)}
              className="form-textarea-control"
              placeholder="e.g. Key client accounts notes..."
            />
          </div>
        </div>

        {/* Sticky Actions Bar at Footer */}
        <div className="customer-form-footer-actions">
          <button type="submit" className="action-footer-btn save-btn">
            {editingCustomer ? "Update Contact" : "Save Contact"}
          </button>
          
          <button type="button" className="action-footer-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCustomerForm;
