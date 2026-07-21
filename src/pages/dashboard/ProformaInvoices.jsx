import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CreateProformaInvoiceForm from "../../components/ProformaInvoice/CreateProformaInvoiceForm";
import { useApp } from "../../context/AppContext";
import "./SalesPages.css";

function ProformaInvoices() {
  const { proformaInvoices, addProformaInvoice, updateProformaInvoice, deleteProformaInvoice } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit and Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPI, setEditingPI] = useState(null);

  // Summary Metrics calculations
  const totalCount = proformaInvoices.length;
  const sentCount = proformaInvoices.filter((p) => p.status === "Sent").length;
  const invoicedCount = proformaInvoices.filter((p) => p.status === "Invoiced").length;
  const draftCount = proformaInvoices.filter((p) => p.status === "Draft").length;

  const totalValue = proformaInvoices.reduce((acc, curr) => {
    const num = parseFloat(curr.amount.replace(/[^\d.]/g, "")) || 0;
    return acc + num;
  }, 0);

  const handleEditClick = (pi) => {
    setEditingPI(pi);
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditingPI(null);
    setIsCreating(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this proforma invoice?")) {
      deleteProformaInvoice(id);
    }
  };

  const handleSaveProforma = (savedPI) => {
    if (isEditing) {
      updateProformaInvoice(savedPI);
    } else {
      addProformaInvoice(savedPI);
    }
    setIsCreating(false);
    setIsEditing(false);
    setEditingPI(null);
  };

  const filteredProformas = proformaInvoices.filter((pi) => {
    const matchSearch = pi.customer.toLowerCase().includes(search.toLowerCase()) || pi.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || pi.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreateProformaInvoiceForm
          editingProformaInvoice={isEditing ? editingPI : null}
          onSave={handleSaveProforma}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingPI(null);
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
            <h1>Proforma Invoices</h1>
            <p className="subtitle">Issue preliminary invoices to clients before sending a finalized invoice.</p>
          </div>
          <div className="sales-header-actions">
            <div className="sales-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search proforma or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sales-primary-btn" onClick={handleCreateClick}>
              + New Proforma
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="sales-summary-cards">
          <div className="sales-summary-card">
            <div className="card-label">Total Proforma Invoices</div>
            <div className="card-value">{totalCount} (₹{totalValue.toLocaleString("en-IN")})</div>
          </div>
          <div className="sales-summary-card">
            <div className="card-label">Sent</div>
            <div className="card-value">{sentCount}</div>
          </div>
          <div className="sales-summary-card">
            <div className="card-label">Invoiced / Finalized</div>
            <div className="card-value" style={{ color: "#166534" }}>{invoicedCount}</div>
          </div>
          <div className="sales-summary-card">
            <div className="card-label">Draft</div>
            <div className="card-value" style={{ color: "#475569" }}>{draftCount}</div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="sales-filters-bar">
          {["All", "Draft", "Sent", "Invoiced", "Expired"].map((statusOption) => (
            <button
              key={statusOption}
              className={`sales-filter-btn ${statusFilter === statusOption ? "active" : ""}`}
              onClick={() => setStatusFilter(statusOption)}
            >
              {statusOption}
            </button>
          ))}
        </div>

        {/* Proforma Invoices Table */}
        <div className="sales-table-card">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Proforma #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Expiry Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProformas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No proforma invoices found.
                  </td>
                </tr>
              ) : (
                filteredProformas.map((pi) => (
                  <tr key={pi.id}>
                    <td style={{ fontWeight: 600, color: "#1b75bb" }}>{pi.id}</td>
                    <td style={{ fontWeight: 500 }}>{pi.customer}</td>
                    <td>{pi.date}</td>
                    <td>{pi.expiryDate}</td>
                    <td style={{ fontWeight: 600 }}>{pi.amount}</td>
                    <td>
                      <span className={`sales-status-badge ${pi.status.toLowerCase()}`}>
                        {pi.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => handleEditClick(pi)}>
                        Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteClick(pi.id)}>
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

export default ProformaInvoices;
