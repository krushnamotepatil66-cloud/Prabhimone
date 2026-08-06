import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreatePurchaseForm from "../../components/Purchase/CreatePurchaseForm";
import {
  FiSearch, FiTrash2, FiPlusCircle, FiShoppingCart,
  FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiEye, FiEdit3
} from "react-icons/fi";
import "./Purchases.css";
import { isFeatureAllowed } from "../../utils/subscriptionLimits";
import UpgradeGate from "../../components/Subscription/UpgradeGate";

const STATUS_COLORS = {
  Received:  { bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  Pending:   { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  Ordered:   { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
};

function PurchaseOrders() {
  const { purchases = [], addPurchase, updatePurchase, deletePurchase, settings } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const cur = settings?.currency || "₹";

  const fmt = (n) =>
    `${cur}${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const basePurchases = (purchases || []).filter(p => p.id?.startsWith("PO-"));

  const filtered = basePurchases.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      (p.id || "").toLowerCase().includes(q) ||
      (p.vendor || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.reference || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalSpend  = basePurchases.reduce((s, p) => s + Number(p.total || 0), 0);
  const pending     = basePurchases.filter((p) => p.status === "Pending").length;
  const received    = basePurchases.filter((p) => p.status === "Received").length;
  const ordered     = basePurchases.filter((p) => p.status === "Ordered").length;

  const handleDelete = (id) => {
    if (window.confirm(`Delete purchase ${id}? This cannot be undone.`)) {
      deletePurchase(id);
    }
  };

  const handleSave = (data) => {
    if (isEditing) {
      updatePurchase(data);
    } else {
      addPurchase(data);
    }
    setIsCreating(false);
    setIsEditing(false);
    setEditingItem(null);
  };


  const planName = settings?.subscriptionStatus === "cancelled" ? null : settings?.subscriptionPlan;
  const purchasesAllowed = isFeatureAllowed(planName, settings?.subscriptionStatus, "purchases");

  if (!purchasesAllowed) {
    return (
      <DashboardLayout>
        <div style={{ padding: "48px 32px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Purchase Orders Unlocked on Professional+</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            Create and track purchase orders. This feature is available from the <strong>Professional</strong> plan and above.
          </p>
          <UpgradeGate
            isOpen={true}
            onClose={null}
            title="Feature Locked"
            description="Purchase Orders are available on the Professional plan."
            currentPlan={planName || "Free"}
            requiredPlan="Professional"
            inline={true}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreatePurchaseForm
          title={isEditing ? "Edit Purchase Order" : "New Purchase Order"}
          submitText={isEditing ? "Update Purchase Order" : "Save Purchase Order"}
          initialData={isEditing ? editingItem : null}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingItem(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pur-page">

        {/* ── Header ── */}
        <div className="pur-header">
          <div className="pur-header-text">
            <h1 className="purchases-title" style={{ display: "flex", alignItems: "center" }}>
              <FiClipboard style={{ marginRight: 10, color: "#7c3aed" }} />
              Purchase Orders
            </h1>
            <p>Manage vendor orders, track deliveries and monitor procurement spend.</p>
          </div>
          <button
            className="pur-new-btn"
            onClick={() => setIsCreating(true)}
          >
            <FiPlusCircle size={16} />
            New Purchase Order
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="pur-stats-grid">
          <div className="pur-stat-card">
            <div className="pur-stat-icon violet"><FiDollarSign size={20} /></div>
            <div>
              <div className="pur-stat-value">{fmt(totalSpend)}</div>
              <div className="pur-stat-label">Total Spend</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon blue"><FiShoppingCart size={20} /></div>
            <div>
              <div className="pur-stat-value">{basePurchases.length}</div>
              <div className="pur-stat-label">Total Orders</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon amber"><FiClock size={20} /></div>
            <div>
              <div className="pur-stat-value">{pending}</div>
              <div className="pur-stat-label">Pending</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon green"><FiCheckCircle size={20} /></div>
            <div>
              <div className="pur-stat-value">{received}</div>
              <div className="pur-stat-label">Received</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="pur-toolbar">
          <div className="pur-search-wrap">
            <FiSearch className="pur-search-icon" size={15} />
            <input
              type="text"
              className="pur-search-input"
              placeholder="Search by vendor, ID, category or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="pur-filter-tabs">
            {["All", "Ordered", "Pending", "Received", "Cancelled"].map((s) => (
              <button
                key={s}
                className={`pur-filter-tab ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="pur-table-card">
          {filtered.length === 0 ? (
            <div className="pur-empty-state">
              <div className="pur-empty-icon">🛒</div>
              <p className="pur-empty-title">No purchase orders found</p>
              <p className="pur-empty-sub">
                {search
                  ? `No results matching "${search}"`
                  : "Create your first purchase order to get started."}
              </p>
              {!search && (
                <button className="pur-new-btn" onClick={() => setIsCreating(true)}>
                  <FiPlusCircle size={15} /> New Purchase Order
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="pur-table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="align-right">Amount</th>
                    <th className="align-right">Tax</th>
                    <th className="align-right">Total</th>
                    <th className="align-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const style = STATUS_COLORS[p.status] || STATUS_COLORS.Pending;
                    return (
                      <tr key={p.id} className="pur-table-row">
                        <td>
                          <span className="pur-id-badge">{p.id}</span>
                        </td>
                        <td className="pur-date">{p.date}</td>
                        <td>
                          <div className="pur-vendor-cell">
                            <div className="pur-vendor-avatar">
                              {(p.vendor || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="pur-vendor-name">{p.vendor || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="pur-category">{p.category || "—"}</span>
                        </td>
                        <td>
                          <span
                            className="pur-status-chip"
                            style={{
                              background: style.bg,
                              color: style.color,
                              border: `1px solid ${style.border}`,
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="align-right pur-amount">{fmt(p.amount)}</td>
                        <td className="align-right pur-tax">{fmt(p.tax)}</td>
                        <td className="align-right pur-total">{fmt(p.total)}</td>
                        <td className="align-center">
                          <div className="pur-actions">
                            <button
                              className="pur-action-btn edit"
                              title="Edit"
                              onClick={() => {
                                setEditingItem(p);
                                setIsEditing(true);
                              }}
                            >
                              <FiEdit3 size={14} />
                            </button>
                            <button
                              className="pur-action-btn view"
                              title="View Details"
                              onClick={() => setViewItem(p)}
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              className="pur-action-btn delete"
                              title="Delete"
                              onClick={() => handleDelete(p.id)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="pur-table-footer">
                Showing <strong>{filtered.length}</strong> of{" "}
                <strong>{basePurchases.length}</strong> purchase orders
              </div>
            </>
          )}
        </div>

        {/* ── View Detail Modal ── */}
        {viewItem && (
          <div className="pur-modal-overlay" onClick={() => setViewItem(null)}>
            <div className="pur-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="pur-modal-header">
                <div>
                  <h2>{viewItem.id}</h2>
                  <p className="pur-modal-vendor">{viewItem.vendor}</p>
                </div>
                <button className="pur-modal-close" onClick={() => setViewItem(null)}>✕</button>
              </div>
              <div className="pur-modal-body">
                <div className="pur-modal-row">
                  <span>Date</span><span>{viewItem.date}</span>
                </div>
                <div className="pur-modal-row">
                  <span>Category</span><span>{viewItem.category}</span>
                </div>
                <div className="pur-modal-row">
                  <span>Reference</span><span>{viewItem.reference || "—"}</span>
                </div>
                <div className="pur-modal-row">
                  <span>Payment Mode</span><span>{viewItem.paymentMode || "—"}</span>
                </div>
                <div className="pur-modal-row">
                  <span>Status</span>
                  <span
                    className="pur-status-chip"
                    style={{
                      background: (STATUS_COLORS[viewItem.status] || STATUS_COLORS.Pending).bg,
                      color: (STATUS_COLORS[viewItem.status] || STATUS_COLORS.Pending).color,
                      border: `1px solid ${(STATUS_COLORS[viewItem.status] || STATUS_COLORS.Pending).border}`,
                    }}
                  >{viewItem.status}</span>
                </div>
                <div className="pur-modal-divider" />
                <div className="pur-modal-row">
                  <span>Amount</span><span>{fmt(viewItem.amount)}</span>
                </div>
                <div className="pur-modal-row">
                  <span>Tax ({viewItem.gstRate || 0}%)</span><span>{fmt(viewItem.tax)}</span>
                </div>
                <div className="pur-modal-row total-row">
                  <span>Total</span><span>{fmt(viewItem.total)}</span>
                </div>
                {viewItem.notes && (
                  <>
                    <div className="pur-modal-divider" />
                    <div className="pur-modal-notes">
                      <span>Notes</span>
                      <p>{viewItem.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default PurchaseOrders;
