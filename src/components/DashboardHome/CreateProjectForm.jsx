import { useState } from "react";
import { useApp } from "../../context/AppContext";
import "./CreateProjectForm.css";

const emptyForm = {
  name: "",
  customer: "",
  hours: "",
  status: "Active",
};

function CreateProjectForm({ onSave, onCancel }) {
  const { customers } = useApp();
  const [form, setForm] = useState(emptyForm);

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.customer) {
      alert("Please fill in project name and customer.");
      return;
    }

    onSave({
      ...form,
      hours: Number(form.hours) || 0,
    });
  };

  return (
    <div className="zoho-project-form-container">
      {/* Header */}
      <div className="form-page-header">
        <h2>Create New Project</h2>
        <button className="form-close-x" onClick={onCancel} title="Close Form">
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="zoho-billing-form">
        {/* Core Details Card */}
        <div className="form-section-card">
          <h3 className="section-card-title">Project Details</h3>
          <div className="customer-fields-grid">
            <div className="form-field-group">
              <label className="required-label">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={(e) => handleInput("name", e.target.value)}
                required
                className="form-input-control"
              />
            </div>

            <div className="form-field-group">
              <label className="required-label">Customer</label>
              <select
                value={form.customer}
                onChange={(e) => handleInput("customer", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label>Initial Logged Hours</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={form.hours === 0 ? "" : form.hours}
                onChange={(e) => handleInput("hours", e.target.value)}
                min="0"
                className="form-input-control"
              />
            </div>

            <div className="form-field-group">
              <label className="required-label">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleInput("status", e.target.value)}
                required
                className="form-input-control"
              >
                <option value="Active">Active</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="customer-form-footer-actions">
          <button type="submit" className="action-footer-btn save-btn">
            Create Project
          </button>
          
          <button type="button" className="action-footer-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProjectForm;
