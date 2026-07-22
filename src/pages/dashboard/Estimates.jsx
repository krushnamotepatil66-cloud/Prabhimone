import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CreateEstimateForm from "../../components/Estimate/CreateEstimateForm";
import { useApp } from "../../context/AppContext";
import "./SalesPages.css";

function Estimates() {
  const { estimates, addEstimate, updateEstimate, deleteEstimate } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit and Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEst, setEditingEst] = useState(null);

  // Summary Metrics calculations
  const totalCount = estimates.length;
  const sentCount = estimates.filter((e) => e.status === "Sent").length;
  const acceptedCount = estimates.filter((e) => e.status === "Accepted").length;
  const draftCount = estimates.filter((e) => e.status === "Draft").length;

  const totalValue = estimates.reduce((acc, curr) => {
    const num = parseFloat(curr.amount.replace(/[^\d.]/g, "")) || 0;
    return acc + num;
  }, 0);

  const handleEditClick = (est) => {
    setEditingEst(est);
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditingEst(null);
    setIsCreating(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this estimate?")) {
      deleteEstimate(id);
    }
  };

  const handleSaveEstimate = (savedEst) => {
    if (isEditing) {
      updateEstimate(savedEst);
    } else {
      addEstimate(savedEst);
    }
    setIsCreating(false);
    setIsEditing(false);
    setEditingEst(null);
  };

  const filteredEstimates = estimates.filter((est) => {
    const matchSearch = est.customer.toLowerCase().includes(search.toLowerCase()) || est.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || est.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreateEstimateForm
          editingEstimate={isEditing ? editingEst : null}
          onSave={handleSaveEstimate}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingEst(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="sales-page-container">
        {/* Header Section */}
        <div className="sales-page-header">
          <div>
            <h1>Estimates & Quotations</h1>
            <p className="subtitle">Create professional quotes and estimates for your customers.</p>
          </div>
          <div className="sales-header-actions">
            <div className="sales-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search estimate or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sales-primary-btn" onClick={handleCreateClick}>
              + New Estimate
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="sales-summary-cards">
          <div className="sales-summary-card total">
            <div className="sales-card-icon">🧾</div>
            <div className="sales-card-body">
              <span className="card-label">Total Estimates</span>
              <span className="card-value">₹{totalValue.toLocaleString("en-IN")}</span>
              <span className="sales-card-sub">{totalCount} estimates total</span>
            </div>
          </div>

          <div className="sales-summary-card revenue">
            <div className="sales-card-icon">📤</div>
            <div className="sales-card-body">
              <span className="card-label">Sent</span>
              <span className="card-value">{sentCount}</span>
              <span className="sales-card-sub">Pending client response</span>
            </div>
          </div>

          <div className="sales-summary-card paid">
            <div className="sales-card-icon">✅</div>
            <div className="sales-card-body">
              <span className="card-label">Accepted</span>
              <span className="card-value">{acceptedCount}</span>
              <span className="sales-card-sub">Approved by customers</span>
            </div>
          </div>

          <div className="sales-summary-card outstanding">
            <div className="sales-card-icon">📝</div>
            <div className="sales-card-body">
              <span className="card-label">Draft</span>
              <span className="card-value">{draftCount}</span>
              <span className="sales-card-sub">Work in progress</span>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="sales-filters-bar">
          {["All", "Draft", "Sent", "Accepted", "Declined"].map((statusOption) => (
            <button
              key={statusOption}
              className={`sales-filter-btn ${statusFilter === statusOption ? "active" : ""}`}
              onClick={() => setStatusFilter(statusOption)}
            >
              {statusOption}
            </button>
          ))}
        </div>

        {/* Estimates Table */}
        <div className="sales-table-card">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Estimate #</th>
                <th>Customer</th>
                <th>Estimate Date</th>
                <th>Expiry Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No estimates found.
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((est) => (
                  <tr key={est.id}>
                    <td style={{ fontWeight: 600, color: "#1b75bb" }}>{est.id}</td>
                    <td style={{ fontWeight: 500 }}>{est.customer}</td>
                    <td>{est.date}</td>
                    <td>{est.expiryDate}</td>
                    <td style={{ fontWeight: 600 }}>{est.amount}</td>
                    <td>
                      <span className={`sales-status-badge ${est.status.toLowerCase()}`}>
                        {est.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => handleEditClick(est)}>
                        Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteClick(est.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Estimates;
