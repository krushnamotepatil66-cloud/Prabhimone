import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import VendorModal from "../../components/Purchase/VendorModal";
import { isFeatureAllowed } from "../../utils/subscriptionLimits";
import UpgradeGate from "../../components/Subscription/UpgradeGate";
import "../dashboard/Customers.css"; // Reuse Customers CSS for similar layout

// Import Shared Layout and Component Styles
import "../../components/Invoice/InvoiceTable.css";
import "../../components/Invoice/InvoiceHeader.css";
import "../../pages/dashboard/Invoices.css";
import "../../components/InvoiceSummary/InvoiceSummary.css";

function Vendors() {
  const {
    vendors,
    purchases,
    settings,
    addVendor,
    updateVendor,
    deleteVendor,
  } = useApp();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const rowsPerPage = 10;

  // Reset to page 1 if query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const statusOptions = {
    All: "All Vendors",
    Active: "Active Vendors",
    Pending: "With Pending Orders",
  };

  // Helper to parse amount strings
  const parseAmount = (amtStr) => {
    return Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;
  };

  // Helper to calculate pending orders for a vendor name
  const getVendorPending = (vendorName) => {
    return purchases
      .filter((pur) => pur.vendor === vendorName && pur.status === "Pending")
      .reduce((sum, pur) => sum + parseAmount(pur.total || pur.amount), 0);
  };

  // Helper to calculate total spend for a vendor name
  const getVendorSpend = (vendorName) => {
    return purchases
      .filter((pur) => pur.vendor === vendorName)
      .reduce((sum, pur) => sum + parseAmount(pur.total || pur.amount), 0);
  };

  // Filter vendors based on search and status
  const filteredVendors = vendors.filter((v) => {
    const name = v.name || "";
    const email = v.email || "";
    const company = v.company || "";
    const city = v.city || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase());

    const hasPending = getVendorPending(v.name) > 0;
    const isActive = purchases.some((pur) => pur.vendor === v.name);

    let matchStatus = true;
    if (status === "Active") {
      matchStatus = isActive;
    } else if (status === "Pending") {
      matchStatus = hasPending;
    }

    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVendors.length / rowsPerPage)
  );

  const start = (currentPage - 1) * rowsPerPage;
  const currentVendors = filteredVendors.slice(start, start + rowsPerPage);

  const handleSelect = (e, id) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === currentVendors.length) {
      setSelected([]);
    } else {
      setSelected(currentVendors.map((item) => item.id));
    }
  };

  // Calculate high-level stats
  const totalVendors = vendors.length;
  const totalPending = vendors.reduce(
    (sum, v) => sum + getVendorPending(v.name),
    0
  );
  const activePurchasingVendors = vendors.filter(
    (v) => purchases.some((pur) => pur.vendor === v.name)
  ).length;

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete vendor ${name}? All purchase connection records will remain.`
    );
    if (!confirmDelete) return;

    deleteVendor(id);
    if (selectedVendor && selectedVendor.id === id) {
      setSelectedVendor(null);
    }
  };

  const handleEdit = (vendor, e) => {
    e.stopPropagation();
    setEditingVendor(vendor);
    setIsEditing(true);
  };

  const planName = settings?.subscriptionStatus === "cancelled" ? null : settings?.subscriptionPlan;
  const purchasesAllowed = isFeatureAllowed(planName, settings?.subscriptionStatus, "purchases");

  if (!purchasesAllowed) {
    return (
      <DashboardLayout>
        <div style={{ padding: "48px 32px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Vendors Unlocked on Professional+</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            Manage your vendors and supplier contacts. This feature is available from the <strong>Professional</strong> plan and above.
          </p>
          <UpgradeGate
            isOpen={true}
            onClose={null}
            title="Feature Locked"
            description="Vendor management is available on the Professional plan."
            currentPlan={planName || "Free"}
            requiredPlan="Professional"
            inline={true}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header matching Invoice Header exactly */}
      <div className="invoice-header">
        <div className="invoice-header-left">
          <div className="status-selector-container">
            <button
              className="status-selector-btn"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <h2>{statusOptions[status] || "Vendors"}</h2>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showStatusDropdown && (
              <>
                <div 
                  className="status-dropdown-overlay" 
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="status-dropdown-menu">
                  {Object.entries(statusOptions).map(([key, label]) => (
                    <div
                      key={key}
                      className={`status-dropdown-item ${status === key ? "active" : ""}`}
                      onClick={() => {
                        setStatus(key);
                        setShowStatusDropdown(false);
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="invoice-actions">
          <div className="search-bar-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="primary-btn add-invoice-btn"
              onClick={() => {
                setEditingVendor(null);
                setIsCreating(true);
              }}
            >
              + New Vendor
            </button>
          </div>
        </div>
      </div>

      {selectedVendor ? (
        /* Full Width Details Preview Panel */
        <div className="invoice-full-preview-container">
          <div className="customer-details-drawer" style={{ width: "100%", position: "static", maxHeight: "none", boxShadow: "none" }}>
            <div className="drawer-header">
              <h3>Vendor Overview</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="btn-icon edit-btn"
                  title="Edit Vendor"
                  onClick={() => { setEditingVendor(selectedVendor); setIsEditing(true); }}
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  ✏️ Edit
                </button>
                <button className="close-drawer-btn" onClick={() => setSelectedVendor(null)}>✕</button>
              </div>
            </div>

            <div className="drawer-body">
              <div className="drawer-avatar-card">
                <div className="large-avatar">{selectedVendor.name.charAt(0)}</div>
                <h2>{selectedVendor.name}</h2>
                <p>{selectedVendor.company || "No Company Specified"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
                  {selectedVendor.gstin && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "#f0fdf4", border: "1px solid #86efac",
                      borderRadius: "6px", padding: "4px 12px",
                      fontSize: "12px", fontWeight: 600, color: "#16a34a", letterSpacing: "0.5px"
                    }}>
                      🏷️ GSTIN: {selectedVendor.gstin}
                    </div>
                  )}
                  {selectedVendor.state && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "#eff6ff", border: "1px solid #93c5fd",
                      borderRadius: "6px", padding: "4px 12px",
                      fontSize: "12px", fontWeight: 600, color: "#2563eb", letterSpacing: "0.5px"
                    }}>
                      🗺️ {selectedVendor.state}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & General Details */}
              <h4 style={{ color: "#334155", fontWeight: 600, marginBottom: "10px", marginTop: "4px" }}>General & Contact Information</h4>
              <div className="drawer-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
                {selectedVendor.email && (
                  <div className="info-block">
                    <label>Email Address</label>
                    <p>{selectedVendor.email}</p>
                  </div>
                )}
                {selectedVendor.phone && (
                  <div className="info-block">
                    <label>Mobile / Phone</label>
                    <p>{selectedVendor.phone}</p>
                  </div>
                )}
                {selectedVendor.company && (
                  <div className="info-block">
                    <label>Company Name</label>
                    <p>{selectedVendor.company}</p>
                  </div>
                )}
                {selectedVendor.gstin && (
                  <div className="info-block">
                    <label>GSTIN</label>
                    <p>{selectedVendor.gstin}</p>
                  </div>
                )}
                {selectedVendor.state && (
                  <div className="info-block">
                    <label>State</label>
                    <p>{selectedVendor.state}</p>
                  </div>
                )}
                {selectedVendor.pincode && (
                  <div className="info-block">
                    <label>Pincode</label>
                    <p>{selectedVendor.pincode}</p>
                  </div>
                )}
              </div>

              <hr className="drawer-divider" />

              {/* Billing & Shipping Addresses side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Billing Address */}
                <div>
                  <h4 style={{ color: "#334155", fontWeight: 600, marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #e2e8f0" }}>
                    📍 Billing Address
                  </h4>
                  {selectedVendor.address || selectedVendor.city || selectedVendor.state || selectedVendor.pincode ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedVendor.address && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>Street</label>
                          <p>{selectedVendor.address}</p>
                        </div>
                      )}
                      {selectedVendor.city && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>City</label>
                          <p>{selectedVendor.city}</p>
                        </div>
                      )}
                      {selectedVendor.state && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>State</label>
                          <p>{selectedVendor.state}</p>
                        </div>
                      )}
                      {selectedVendor.pincode && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>Pincode</label>
                          <p>{selectedVendor.pincode}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>No billing address saved</p>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 style={{ color: "#334155", fontWeight: 600, marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #e2e8f0" }}>
                    🚚 Shipping Address
                  </h4>
                  {selectedVendor.shippingSameAsBilling === false ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedVendor.shippingAddress && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>Street</label>
                          <p>{selectedVendor.shippingAddress}</p>
                        </div>
                      )}
                      {selectedVendor.shippingCity && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>City</label>
                          <p>{selectedVendor.shippingCity}</p>
                        </div>
                      )}
                      {selectedVendor.shippingState && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>State</label>
                          <p>{selectedVendor.shippingState}</p>
                        </div>
                      )}
                      {selectedVendor.shippingPincode && (
                        <div className="info-block" style={{ margin: 0 }}>
                          <label>Pincode</label>
                          <p>{selectedVendor.shippingPincode}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", fontSize: "13px" }}>Same as billing address</p>
                  )}
                </div>
              </div>

              <hr className="drawer-divider" />

              <h4>Financial Overview</h4>
              <div className="drawer-financials">
                <div className="fin-box">
                  <span>Total Spend</span>
                  <strong>
                    {settings.currency}
                    {getVendorSpend(selectedVendor.name).toLocaleString()}
                  </strong>
                </div>
                <div className="fin-box outstanding">
                  <span>Pending Amount</span>
                  <strong>
                    {settings.currency}
                    {getVendorPending(selectedVendor.name).toLocaleString()}
                  </strong>
                </div>
              </div>

              <hr className="drawer-divider" />

              <h4>Purchases ({purchases.filter((p) => p.vendor === selectedVendor.name).length})</h4>
              <div className="drawer-invoices-list">
                {purchases.filter((p) => p.vendor === selectedVendor.name).length === 0 ? (
                  <p className="no-invoices">No purchase history found.</p>
                ) : (
                  purchases
                    .filter((p) => p.vendor === selectedVendor.name)
                    .map((pur) => (
                      <div key={pur.id} className="drawer-invoice-card">
                        <div>
                          <strong>{pur.id}</strong>
                          <small>{pur.date}</small>
                        </div>
                        <div>
                          <strong>{settings.currency}{(pur.total || pur.amount || 0).toLocaleString()}</strong>
                          <span className={`status-badge-small ${pur.status?.toLowerCase() || 'pending'}`}>
                            {pur.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full width table & summary cards */
        <>
          {/* ── Summary Cards ── */}
          <div className="invoice-summary-cards">
            <div className="inv-summary-card total">
              <div className="inv-card-icon">👥</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Total Vendors</span>
                <span className="inv-card-value">{totalVendors}</span>
                <span className="inv-card-sub">Registered in system</span>
              </div>
            </div>

            <div className="inv-summary-card paid">
              <div className="inv-card-icon">✅</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Active Suppliers</span>
                <span className="inv-card-value">{activePurchasingVendors}</span>
                <span className="inv-card-sub">With purchase history</span>
              </div>
            </div>

            <div className="inv-summary-card outstanding">
              <div className="inv-card-icon">⏳</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Pending Payables</span>
                <span className="inv-card-value">{settings.currency}{totalPending.toLocaleString()}</span>
                <span className="inv-card-sub">{totalPending > 0 ? "Pending payment/delivery" : "All cleared"}</span>
              </div>
            </div>
          </div>

          <div className="table-card">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Company</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: "right" }}>Pending Payables</th>
                  <th style={{ textAlign: "right" }}>Total Spend</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  currentVendors.map((vendor) => {
                    const pending = getVendorPending(vendor.name);
                    const spend = getVendorSpend(vendor.name);
                    const isSelectedRow = selectedVendor?.id === vendor.id;

                    return (
                      <tr
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className={`invoice-row ${isSelectedRow ? "selected-row" : ""}`}
                        style={{ cursor: "pointer" }}
                      >

                        <td>
                          <div className="customer-avatar-name">
                            <span className="avatar-placeholder">
                              {vendor.name.charAt(0)}
                            </span>
                            <div>
                              <div className="cust-name">{vendor.name}</div>
                              <span className="cust-city">{vendor.city || "Unknown City"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{vendor.company || "—"}</td>
                        <td>
                          <div className="contact-details-sub">
                            <div>{vendor.email}</div>
                            <small>{vendor.phone || "No phone"}</small>
                          </div>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: pending > 0 ? "#ea4335" : "#64748b" }}>
                          {settings.currency}{pending.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                          {settings.currency}{spend.toLocaleString()}
                        </td>
                        <td className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit-btn"
                              onClick={(e) => handleEdit(vendor, e)}
                              title="Edit Vendor"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon delete-btn"
                              onClick={(e) => handleDelete(vendor.id, vendor.name, e)}
                              title="Delete Vendor"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="table-footer">
              <span className="selected-count">
                Total: {filteredVendors.length} vendors
              </span>

              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  ◀ Prev
                </button>

                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vendor Modal Popup */}
      <VendorModal
        isOpen={isCreating || isEditing}
        editingVendor={isEditing ? editingVendor : null}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setEditingVendor(null);
        }}
        onSave={(vendor) => {
          if (isEditing) {
            updateVendor(vendor);
            // Update selectedVendor detail view if active
            if (selectedVendor && selectedVendor.id === vendor.id) {
              setSelectedVendor(vendor);
            }
          } else {
            addVendor(vendor);
          }
        }}
      />
    </DashboardLayout>
  );
}

export default Vendors;
