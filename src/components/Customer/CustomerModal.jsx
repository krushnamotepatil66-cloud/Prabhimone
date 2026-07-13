import { useState, useEffect } from "react";
import "./CustomerModal.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => handleInput("name", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="e.g. rahul@gmail.com"
              value={form.email}
              onChange={(e) => handleInput("email", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={(e) => handleInput("phone", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g. Sharma Tech Solutions"
              value={form.company}
              onChange={(e) => handleInput("company", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="e.g. 404 Main St"
              value={form.address}
              onChange={(e) => handleInput("address", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={(e) => handleInput("city", e.target.value)}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">
              {editingCustomer ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerModal;
