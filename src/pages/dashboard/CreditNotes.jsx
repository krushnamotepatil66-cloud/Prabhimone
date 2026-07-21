import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CreateCreditNoteForm from "../../components/CreditNote/CreateCreditNoteForm";
import { useApp } from "../../context/AppContext";
import "./SalesPages.css";

function CreditNotes() {
  const { creditNotes, addCreditNote, updateCreditNote, deleteCreditNote } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit and Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCN, setEditingCN] = useState(null);

  // Summary Metrics calculations
  const totalCount = creditNotes.length;
  const openCount = creditNotes.filter((c) => c.status === "Open").length;
  const closedCount = creditNotes.filter((c) => c.status === "Closed").length;

  const totalValue = creditNotes.reduce((acc, curr) => {
    const num = parseFloat(curr.amount.replace(/[^\d.]/g, "")) || 0;
    return acc + num;
  }, 0);

  const handleEditClick = (cn) => {
    setEditingCN(cn);
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditingCN(null);
    setIsCreating(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this credit note?")) {
      deleteCreditNote(id);
    }
  };

  const handleSaveCreditNote = (savedCN) => {
    if (isEditing) {
      updateCreditNote(savedCN);
    } else {
      addCreditNote(savedCN);
    }
    setIsCreating(false);
    setIsEditing(false);
    setEditingCN(null);
  };

  const filteredCreditNotes = creditNotes.filter((cn) => {
    const matchSearch = cn.customer.toLowerCase().includes(search.toLowerCase()) || cn.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || cn.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreateCreditNoteForm
          editingCreditNote={isEditing ? editingCN : null}
          onSave={handleSaveCreditNote}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingCN(null);
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
            <h1>Credit Notes</h1>
            <p className="subtitle">Issue credits to customers for invoice returns or price adjustments.</p>
          </div>
          <div className="sales-header-actions">
            <div className="sales-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search credit note or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sales-primary-btn" onClick={handleCreateClick}>
              + New Credit Note
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="sales-summary-cards">
          <div className="sales-summary-card">
            <div className="card-label">Total Credit Notes</div>
            <div className="card-value">{totalCount} (₹{totalValue.toLocaleString("en-IN")})</div>
          </div>
          <div className="sales-summary-card">
            <div className="card-label">Open / Unapplied</div>
            <div className="card-value" style={{ color: "#1d4ed8" }}>{openCount}</div>
          </div>
          <div className="sales-summary-card">
            <div className="card-label">Closed / Refunded</div>
            <div className="card-value" style={{ color: "#166534" }}>{closedCount}</div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="sales-filters-bar">
          {["All", "Open", "Closed"].map((statusOption) => (
            <button
              key={statusOption}
              className={`sales-filter-btn ${statusFilter === statusOption ? "active" : ""}`}
              onClick={() => setStatusFilter(statusOption)}
            >
              {statusOption}
            </button>
          ))}
        </div>

        {/* Credit Notes Table */}
        <div className="sales-table-card">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Credit Note #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Reference Invoice</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCreditNotes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No credit notes found.
                  </td>
                </tr>
              ) : (
                filteredCreditNotes.map((cn) => (
                  <tr key={cn.id}>
                    <td style={{ fontWeight: 600, color: "#1b75bb" }}>{cn.id}</td>
                    <td style={{ fontWeight: 500 }}>{cn.customer}</td>
                    <td>{cn.date}</td>
                    <td style={{ fontWeight: 600, color: "#475569" }}>{cn.invoiceId || "N/A"}</td>
                    <td style={{ fontWeight: 600 }}>{cn.amount}</td>
                    <td>
                      <span className={`sales-status-badge ${cn.status.toLowerCase()}`}>
                        {cn.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => handleEditClick(cn)}>
                        Edit
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteClick(cn.id)}>
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

export default CreditNotes;
