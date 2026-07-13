import { useState } from "react";
import { useApp } from "../../context/AppContext";
import "../Invoice/CreateInvoiceModal.css"; // Reuse modal classes

function CreateProjectModal({ isOpen, onClose }) {
  const { customers, addProject } = useApp();
  const [form, setForm] = useState({
    name: "",
    customer: "",
    hours: "",
    status: "Active",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.customer) {
      alert("Please fill in project name and customer.");
      return;
    }

    addProject({
      ...form,
      hours: Number(form.hours) || 0,
    });

    // Reset and close
    setForm({
      name: "",
      customer: "",
      hours: "",
      status: "Active",
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Project</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Customer</label>
            <select
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Initial Logged Hours</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={form.hours === 0 ? "" : form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#4b5563" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
            >
              <option value="Active">Active</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <div className="modal-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                background: "#1b75bb",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
