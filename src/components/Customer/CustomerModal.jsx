import { useState, useEffect } from "react";
import "./CustomerModal.css";

const emptyForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  gstin: "",
  address: "",
  state: "",
  pincode: "",
  city: "",
  shippingSameAsBilling: true,
  shippingAddress: "",
  shippingState: "",
  shippingPincode: "",
  shippingCity: "",
};

function CustomerModal({ isOpen, onClose, onSave, editingCustomer, initialName = "" }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (editingCustomer) {
      setForm(editingCustomer);
    } else {
      setForm({
        ...emptyForm,
        name: initialName || "",
      });
    }
  }, [editingCustomer, initialName, isOpen]);

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
    <div className="modal-overlay">
      <div className={`party-modal ${!form.shippingSameAsBilling ? "large-modal" : ""}`}>
        <div className="modal-header-custom">
          <h2>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
          <button className="close-btn-custom" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="party-form">
          <div className="form-body">
            <div className="form-group-custom">
              <input
                type="text"
                className="name-input"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            
            <div className="form-row-custom">
              <div className="form-group-custom half-width">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInput("email", e.target.value)}
                  placeholder="ex. customer@gmail.com"
                />
              </div>
              <div className="form-group-custom half-width">
                <label>Company Name</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => handleInput("company", e.target.value)}
                  placeholder="ex. Acme Technologies"
                />
              </div>
            </div>

            <div className="form-row-custom">
              <div className="form-group-custom half-width">
                <label>Mobile Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleInput("phone", e.target.value)}
                  placeholder="ex. 9876543210"
                />
              </div>
              <div className="form-group-custom half-width">
                <label>GSTIN</label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => handleInput("gstin", e.target.value)}
                  placeholder="ex. 27AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div className="address-section">
              <div className={`addresses-grid ${!form.shippingSameAsBilling ? "two-columns" : ""}`}>
                {/* Billing Address */}
                <div className="billing-address-container">
                  <label className="billing-label">BILLING ADDRESS <span className="required-star">*</span></label>
                  <textarea
                    value={form.address}
                    onChange={(e) => handleInput("address", e.target.value)}
                    placeholder="ex. 123 Main Street, Industrial Area"
                    rows="3"
                    className="billing-textarea"
                  />

                  <div className="form-row-custom">
                    <div className="form-group-custom half-width">
                      <label className="billing-label">STATE</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => handleInput("state", e.target.value)}
                        placeholder="ex. Maharashtra"
                      />
                    </div>
                    <div className="form-group-custom half-width">
                      <label className="billing-label">PINCODE</label>
                      <input
                        type="text"
                        value={form.pincode}
                        onChange={(e) => handleInput("pincode", e.target.value)}
                        placeholder="ex. 400001"
                      />
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="billing-label">CITY</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleInput("city", e.target.value)}
                      placeholder="ex. Mumbai"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                {!form.shippingSameAsBilling && (
                  <div className="billing-address-container">
                    <label className="billing-label">SHIPPING ADDRESS <span className="required-star">*</span></label>
                    <textarea
                      value={form.shippingAddress}
                      onChange={(e) => handleInput("shippingAddress", e.target.value)}
                      placeholder="ex. 123 Main Street, Industrial Area"
                      rows="3"
                      className="billing-textarea"
                    />

                    <div className="form-row-custom">
                      <div className="form-group-custom half-width">
                        <label className="billing-label">STATE</label>
                        <input
                          type="text"
                          value={form.shippingState}
                          onChange={(e) => handleInput("shippingState", e.target.value)}
                          placeholder="ex. Maharashtra"
                        />
                      </div>
                      <div className="form-group-custom half-width">
                        <label className="billing-label">PINCODE</label>
                        <input
                          type="text"
                          value={form.shippingPincode}
                          onChange={(e) => handleInput("shippingPincode", e.target.value)}
                          placeholder="ex. 400001"
                        />
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label className="billing-label">CITY</label>
                      <input
                        type="text"
                        value={form.shippingCity}
                        onChange={(e) => handleInput("shippingCity", e.target.value)}
                        placeholder="ex. Mumbai"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.shippingSameAsBilling}
                  onChange={(e) => handleInput("shippingSameAsBilling", e.target.checked)}
                />
                Shipping address same as billing address
              </label>
            </div>
          </div>

          <div className="modal-footer-custom">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerModal;
