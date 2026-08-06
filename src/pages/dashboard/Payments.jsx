import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import RecordPaymentForm from "../../components/Payment/RecordPaymentForm";
import PaymentDetailModal from "../../components/Payment/PaymentDetailModal";
import "./Payments.css";
import "../../pages/dashboard/Invoices.css";

function Payments() {
  const { payments, addPayment, deletePayment, settings } = useApp();
  const currency = settings?.currency || "₹";

  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");

  const [searchParams, setSearchParams] = useSearchParams();

  // Monitor Query Parameters for redirections (?action=new)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Unique payment methods in data
  const availableMethods = useMemo(() => {
    const methods = [...new Set(payments.map((p) => p.method).filter(Boolean))];
    return methods;
  }, [payments]);

  // Filter + Sort payments
  const filteredPayments = useMemo(() => {
    let list = payments.filter((p) => {
      const matchSearch =
        p.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
        p.method?.toLowerCase().includes(search.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = filterMethod === "All" || p.method === filterMethod;

      const matchDateFrom = !filterDateFrom || p.date >= filterDateFrom;
      const matchDateTo = !filterDateTo || p.date <= filterDateTo;

      return matchSearch && matchMethod && matchDateFrom && matchDateTo;
    });

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "date_desc") return b.date.localeCompare(a.date);
      if (sortBy === "date_asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
      if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
      if (sortBy === "customer") return a.customerName.localeCompare(b.customerName);
      return 0;
    });

    return list;
  }, [payments, search, filterMethod, filterDateFrom, filterDateTo, sortBy]);

  // Stats
  const totalCollections = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const thisMonthPayments = payments.filter((p) => {
    const now = new Date();
    const pDate = new Date(p.date);
    return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const avgPayment = payments.length > 0 ? totalCollections / payments.length : 0;

  // Method breakdown
  const methodBreakdown = useMemo(() => {
    const breakdown = {};
    payments.forEach((p) => {
      breakdown[p.method] = (breakdown[p.method] || 0) + Number(p.amount);
    });
    return breakdown;
  }, [payments]);

  const topMethod = Object.entries(methodBreakdown).sort((a, b) => b[1] - a[1])[0];

  const handleDelete = (id, invoiceId) => {
    const confirmDelete = window.confirm(
      `Delete payment ${id}?\n\nThis will revert invoice ${invoiceId} status back to Pending.`
    );
    if (confirmDelete) {
      deletePayment(id);
      if (viewingPayment?.id === id) setViewingPayment(null);
    }
  };

  const handleSavePayment = (paymentData) => {
    addPayment(paymentData);
    setIsCreating(false);
  };

  const handleExportCSV = () => {
    const headers = ["Payment ID", "Date", "Invoice", "Customer", "Method", "Reference", "Amount"];
    const rows = filteredPayments.map((p) => [
      p.id, p.date, p.invoiceId, p.customerName, p.method, p.reference || "", Number(p.amount).toFixed(2)
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const methodColors = {
    "Bank Transfer": "#3b82f6",
    "Cash": "#10b981",
    "UPI": "#8b5cf6",
    "Credit Card": "#f59e0b",
    "Debit Card": "#f59e0b",
    "Cheque": "#64748b",
  };
  const methodIcons = {
    "Bank Transfer": "🏦",
    "Cash": "💵",
    "UPI": "📱",
    "Credit Card": "💳",
    "Debit Card": "💳",
    "Cheque": "📄",
  };

  // ─── Record Payment Form ───────────────────────────────────
  if (isCreating) {
    return (
      <DashboardLayout>
        <RecordPaymentForm
          onSave={handleSavePayment}
          onCancel={() => setIsCreating(false)}
        />
      </DashboardLayout>
    );
  }

  // ─── Main Payments List ────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="payments-page">
        {/* Header */}
        <div className="payments-header">
          <div>
            <h1>Payments Received</h1>
            <p className="subtitle">Log and track all customer payments, receipts, and collections.</p>
          </div>
          <div className="payments-header-actions">
            <button className="payments-export-btn" onClick={handleExportCSV} title="Export as CSV">
              ↓ Export CSV
            </button>
            <button className="record-payment-btn" onClick={() => setIsCreating(true)}>
              + Record Payment
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="invoice-summary-cards">
          <div className="inv-summary-card revenue">
            <div className="inv-card-icon">📈</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Total Collected</span>
              <span className="inv-card-value">{currency}{totalCollections.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span className="inv-card-sub">All time</span>
            </div>
          </div>

          <div className="inv-summary-card paid">
            <div className="inv-card-icon">📅</div>
            <div className="inv-card-body">
              <span className="inv-card-label">This Month</span>
              <span className="inv-card-value">{currency}{thisMonthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span className="inv-card-sub">{thisMonthPayments.length} payment{thisMonthPayments.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="inv-summary-card total">
            <div className="inv-card-icon">🧾</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Total Receipts</span>
              <span className="inv-card-value">{payments.length}</span>
              <span className="inv-card-sub">Transactions logged</span>
            </div>
          </div>

          <div className="inv-summary-card outstanding">
            <div className="inv-card-icon">📊</div>
            <div className="inv-card-body">
              <span className="inv-card-label">Avg. Payment</span>
              <span className="inv-card-value">{currency}{avgPayment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span className="inv-card-sub">{topMethod ? `Top: ${topMethod[0]}` : "No data"}</span>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="payments-controls-bar">
          <div className="payments-search-wrap">
            <span className="search-icon-inner">🔍</span>
            <input
              type="text"
              className="payments-search-input"
              placeholder="Search by customer, invoice, method, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="payments-filter-group">
            {/* Method Filter */}
            <select
              className="payments-filter-select"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="All">All Methods</option>
              {availableMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              className="payments-filter-select"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              title="From Date"
              placeholder="From"
            />

            {/* Date To */}
            <input
              type="date"
              className="payments-filter-select"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              title="To Date"
              placeholder="To"
            />

            {/* Sort */}
            <select
              className="payments-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Amount ↓</option>
              <option value="amount_asc">Amount ↑</option>
              <option value="customer">Customer A–Z</option>
            </select>

            {/* Clear Filters */}
            {(filterMethod !== "All" || filterDateFrom || filterDateTo) && (
              <button
                className="clear-filters-btn"
                onClick={() => { setFilterMethod("All"); setFilterDateFrom(""); setFilterDateTo(""); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results info */}
        {payments.length > 0 && (
          <div className="payments-results-bar">
            <span>
              Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> payment{payments.length !== 1 ? "s" : ""}
              {filteredPayments.length > 0 && (
                <> &nbsp;·&nbsp; Total: <strong>{currency}{filteredPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></>
              )}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="payments-table-container">
          {payments.length === 0 ? (
            <div className="payments-empty-state">
              <div className="empty-state-icon">💳</div>
              <h3>No Payments Yet</h3>
              <p>Start recording customer payments to track your collections.</p>
              <button className="record-payment-btn" onClick={() => setIsCreating(true)}>
                + Record First Payment
              </button>
            </div>
          ) : (
            <table className="payments-list-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th>Reference #</th>
                  <th>Amount Received</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">
                      <div className="no-results-state">
                        <span>🔍</span>
                        <p>No payments match your search or filters.</p>
                        <button className="link-btn" onClick={() => { setSearch(""); setFilterMethod("All"); setFilterDateFrom(""); setFilterDateTo(""); }}>
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const mColor = methodColors[payment.method] || "#64748b";
                    const mIcon = methodIcons[payment.method] || "💰";
                    return (
                      <tr
                        key={payment.id}
                        className="payment-row-item"
                        onClick={() => setViewingPayment(payment)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong className="payment-id">{payment.id}</strong>
                        </td>
                        <td className="payment-date">{payment.date}</td>
                        <td>
                          <span className="invoice-link">{payment.invoiceId}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-avatar">{payment.customerName?.charAt(0)?.toUpperCase() || "?"}</span>
                            <strong>{payment.customerName}</strong>
                          </div>
                        </td>
                        <td>
                          <span
                            className="method-pill"
                            style={{
                              backgroundColor: mColor + "18",
                              color: mColor,
                              borderColor: mColor + "40",
                              border: "1px solid"
                            }}
                          >
                            {mIcon} {payment.method}
                          </span>
                        </td>
                        <td className="reference-cell">{payment.reference || <span className="no-ref">—</span>}</td>
                        <td>
                          <span className="amount-received">
                            {currency}{Number(payment.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <div className="row-actions">
                            <button
                              className="view-action-btn"
                              onClick={(e) => { e.stopPropagation(); setViewingPayment(payment); }}
                              title="View Receipt"
                            >
                              👁 View
                            </button>
                            <button
                              className="delete-action-btn"
                              onClick={(e) => { e.stopPropagation(); handleDelete(payment.id, payment.invoiceId); }}
                              title="Delete Payment"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Method Breakdown (if there are payments) */}
        {payments.length > 0 && Object.keys(methodBreakdown).length > 1 && (
          <div className="method-breakdown-card">
            <h3 className="breakdown-title">Payment Method Breakdown</h3>
            <div className="breakdown-grid">
              {Object.entries(methodBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([method, total]) => {
                  const pct = totalCollections > 0 ? Math.round((total / totalCollections) * 100) : 0;
                  const mColor = methodColors[method] || "#64748b";
                  const mIcon = methodIcons[method] || "💰";
                  const count = payments.filter((p) => p.method === method).length;
                  return (
                    <div key={method} className="breakdown-item">
                      <div className="breakdown-item-header">
                        <span className="breakdown-method">
                          <span>{mIcon}</span> {method}
                        </span>
                        <span className="breakdown-pct" style={{ color: mColor }}>{pct}%</span>
                      </div>
                      <div className="breakdown-bar-wrap">
                        <div
                          className="breakdown-bar"
                          style={{ width: `${pct}%`, background: mColor }}
                        />
                      </div>
                      <div className="breakdown-meta">
                        <span>{currency}{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        <span className="breakdown-count">{count} payment{count !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail / Receipt Modal */}
      {viewingPayment && (
        <PaymentDetailModal
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default Payments;