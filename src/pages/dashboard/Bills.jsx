import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreatePurchaseForm from "../../components/Purchase/CreatePurchaseForm";
import {
  FiSearch, FiTrash2, FiPlusCircle, FiFileText,
  FiDollarSign, FiClock, FiCheckCircle, FiEye,
  FiUpload, FiDownload, FiX, FiAlertCircle, FiCheckSquare, FiFile
} from "react-icons/fi";
import "./Purchases.css";
import "./Bills.css";
import { isFeatureAllowed } from "../../utils/subscriptionLimits";
import UpgradeGate from "../../components/Subscription/UpgradeGate";

const STATUS_COLORS = {
  Paid:    { bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  Unpaid:  { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  Pending: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  Received: { bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  Ordered:  { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  Cancelled:{ bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" },
};

// CSV parser (handles quoted fields)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || "").replace(/^"|"$/g, ""); });
    return obj;
  });
}

// Map parsed row → purchase/bill format
function mapRowToBill(row, index) {
  const get = (...keys) => {
    for (const k of keys) {
      const val = row[k] || row[k.replace(/ /g, "_")] || row[k.replace(/ /g, "")] || "";
      if (val) return val;
    }
    return "";
  };
  const amount  = parseFloat(get("amount", "subtotal", "sub total")) || 0;
  const gstRate = parseFloat(get("gst rate", "gstrate", "tax rate", "taxrate", "gst%", "tax%")) || 0;
  const taxVal  = parseFloat(get("tax", "gst", "tax amount")) || (amount * gstRate) / 100;
  const total   = parseFloat(get("total", "total amount", "grand total")) || amount + taxVal;
  const validStatuses = ["Paid","Unpaid","Pending","Received","Ordered","Cancelled"];
  let status = get("status", "payment status");
  status = validStatuses.find(s => s.toLowerCase() === status.toLowerCase()) || "Pending";

  return {
    id: get("id", "bill id", "billid", "purchase id") || `IMP-${Date.now()}-${index}`,
    date: get("date", "bill date", "invoice date") || new Date().toISOString().slice(0, 10),
    vendor: get("vendor", "vendor name", "supplier", "company"),
    category: get("category", "type"),
    reference: get("reference", "ref", "ref no", "reference no"),
    paymentMode: get("payment mode", "paymentmode", "payment method", "mode"),
    status,
    amount,
    gstRate,
    tax: taxVal,
    total,
    notes: get("notes", "note", "description", "remarks"),
  };
}

function ImportModal({ onClose, onImport }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName]   = useState("");
  const [preview, setPreview]     = useState([]);
  const [error, setError]         = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone]           = useState(false);

  const processFile = (file) => {
    if (!file) return;
    setError("");
    setPreview([]);
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let rows = [];
        if (ext === "json") {
          const json = JSON.parse(text);
          rows = Array.isArray(json) ? json : json.bills || json.data || json.purchases || [];
        } else if (ext === "csv") {
          rows = parseCSV(text);
        } else {
          setError("Unsupported file type. Please upload a .csv or .json file.");
          return;
        }
        if (rows.length === 0) { setError("No data rows found in the file."); return; }
        const mapped = rows.map((r, i) => mapRowToBill(r, i));
        setPreview(mapped);
      } catch (err) {
        setError(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    await new Promise(r => setTimeout(r, 600));
    onImport(preview);
    setImporting(false);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const downloadTemplate = () => {
    const header = "id,date,vendor,category,reference,payment mode,status,amount,gst rate,tax,total,notes";
    const sample = `BILL-001,2025-01-15,Acme Corp,Office Supplies,PO-2025-001,Bank Transfer,Pending,5000,18,900,5900,Sample bill`;
    const blob = new Blob([`${header}\n${sample}`], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "bills_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bill-import-overlay" onClick={onClose}>
      <div className="bill-import-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bim-header">
          <div className="bim-header-left">
            <div className="bim-header-icon"><FiUpload size={20} /></div>
            <div>
              <h2>Import Bills</h2>
              <p>Upload a CSV or JSON file to bulk import bills</p>
            </div>
          </div>
          <button className="bim-close" onClick={onClose}><FiX size={18} /></button>
        </div>

        {/* Template download */}
        <div className="bim-template-bar">
          <FiFile size={14} />
          <span>Need a template?</span>
          <button className="bim-template-btn" onClick={downloadTemplate}>
            <FiDownload size={12} /> Download CSV Template
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`bim-dropzone ${dragOver ? "drag-over" : ""} ${fileName ? "has-file" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {fileName ? (
            <div className="bim-file-selected">
              <FiFileText size={32} className="bim-file-icon" />
              <span className="bim-file-name">{fileName}</span>
              <span className="bim-file-count">{preview.length} bills ready to import</span>
            </div>
          ) : (
            <div className="bim-drop-content">
              <div className="bim-drop-icon"><FiUpload size={30} /></div>
              <p className="bim-drop-title">Drag & drop your file here</p>
              <p className="bim-drop-sub">or <span>click to browse</span></p>
              <div className="bim-formats">
                <span className="bim-format-badge">CSV</span>
                <span className="bim-format-badge">JSON</span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bim-error">
            <FiAlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <div className="bim-preview-section">
            <div className="bim-preview-header">
              <span className="bim-preview-title">Preview ({preview.length} bills)</span>
              <span className="bim-preview-sub">First 5 shown</span>
            </div>
            <div className="bim-preview-scroll">
              <table className="bim-preview-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td><span className="bim-prev-id">{row.id}</span></td>
                      <td>{row.date}</td>
                      <td>{row.vendor || "—"}</td>
                      <td>{row.category || "—"}</td>
                      <td>
                        <span className="bim-prev-status" style={{
                          background: (STATUS_COLORS[row.status] || STATUS_COLORS.Pending).bg,
                          color: (STATUS_COLORS[row.status] || STATUS_COLORS.Pending).color,
                          border: `1px solid ${(STATUS_COLORS[row.status] || STATUS_COLORS.Pending).border}`,
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td>₹{Number(row.amount).toLocaleString("en-IN")}</td>
                      <td>₹{Number(row.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bim-footer">
          <button className="bim-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className={`bim-import-btn ${done ? "done" : ""}`}
            disabled={preview.length === 0 || importing || done}
            onClick={handleImport}
          >
            {done
              ? <><FiCheckSquare size={15} /> Imported!</>
              : importing
              ? <><div className="bim-spinner" /> Importing…</>
              : <><FiUpload size={15} /> Import {preview.length > 0 ? `${preview.length} Bills` : "Bills"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function Bills() {
  const { purchases = [], addPurchase, deletePurchase, settings } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importToast, setImportToast] = useState(null);
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

  const filtered = (purchases || []).filter((p) => {
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
  const totalBilled = (purchases || []).reduce((s, p) => s + Number(p.total || 0), 0);
  const pending     = (purchases || []).filter((p) => p.status === "Pending").length;
  const received    = (purchases || []).filter((p) => p.status === "Received").length;

  const handleDelete = (id) => {
    if (window.confirm(`Delete bill ${id}? This cannot be undone.`)) {
      deletePurchase(id);
    }
  };

  const handleSave = (data) => {
    addPurchase(data);
    setIsCreating(false);
  };

  const handleImport = (bills) => {
    bills.forEach((bill) => addPurchase(bill));
    setShowImport(false);
    setImportToast(`✅ Successfully imported ${bills.length} bill${bills.length > 1 ? "s" : ""}!`);
    setTimeout(() => setImportToast(null), 4000);
  };

  const planName = settings?.subscriptionStatus === "cancelled" ? null : settings?.subscriptionPlan;
  const purchasesAllowed = isFeatureAllowed(planName, settings?.subscriptionStatus, "purchases");

  if (!purchasesAllowed) {
    return (
      <DashboardLayout>
        <div style={{ padding: "48px 32px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Bills Unlocked on Professional+</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            Track vendor bills and payments. This feature is available from the <strong>Professional</strong> plan and above.
          </p>
          <UpgradeGate
            isOpen={true}
            onClose={null}
            title="Feature Locked"
            description="Bills and vendor management are available on the Professional plan."
            currentPlan={planName || "Free"}
            requiredPlan="Professional"
            inline={true}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isCreating) {
    return (
      <DashboardLayout>
        <CreatePurchaseForm
          title="New Bill"
          submitText="Save Bill"
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pur-page">

        {/* ── Toast ── */}
        {importToast && (
          <div className="bill-import-toast">
            {importToast}
          </div>
        )}

        {/* ── Import Modal ── */}
        {showImport && (
          <ImportModal
            onClose={() => setShowImport(false)}
            onImport={handleImport}
          />
        )}

        {/* ── Header ── */}
        <div className="pur-header">
          <div className="pur-header-text">
            <h1 className="purchases-title" style={{ display: "flex", alignItems: "center" }}>
              <FiFileText style={{ marginRight: 10, color: "#7c3aed" }} />
              Vendor Bills
            </h1>
            <p>Track vendor bills, payment statuses, and procurement expenses.</p>
          </div>
          <div className="bill-header-actions">
            <button
              className="bill-import-trigger-btn"
              onClick={() => setShowImport(true)}
            >
              <FiUpload size={15} />
              Import Bills
            </button>
            <button
              className="pur-new-btn"
              onClick={() => setIsCreating(true)}
            >
              <FiPlusCircle size={16} />
              New Bill
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="pur-stats-grid">
          <div className="pur-stat-card">
            <div className="pur-stat-icon violet"><FiDollarSign size={20} /></div>
            <div>
              <div className="pur-stat-value">{fmt(totalBilled)}</div>
              <div className="pur-stat-label">Total Billed</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon blue"><FiFileText size={20} /></div>
            <div>
              <div className="pur-stat-value">{(purchases || []).length}</div>
              <div className="pur-stat-label">Total Bills</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon amber"><FiClock size={20} /></div>
            <div>
              <div className="pur-stat-value">{pending}</div>
              <div className="pur-stat-label">Pending Payment</div>
            </div>
          </div>
          <div className="pur-stat-card">
            <div className="pur-stat-icon green"><FiCheckCircle size={20} /></div>
            <div>
              <div className="pur-stat-value">{received}</div>
              <div className="pur-stat-label">Cleared / Received</div>
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
              placeholder="Search by vendor, bill ID, category or reference..."
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
              <div className="pur-empty-icon">🧾</div>
              <p className="pur-empty-title">No bills found</p>
              <p className="pur-empty-sub">
                {search
                  ? `No results matching "${search}"`
                  : "Record your first vendor bill to get started."}
              </p>
              {!search && (
                <div className="bill-empty-actions">
                  <button className="pur-new-btn" onClick={() => setIsCreating(true)}>
                    <FiPlusCircle size={15} /> New Bill
                  </button>
                  <button className="bill-import-trigger-btn" onClick={() => setShowImport(true)}>
                    <FiUpload size={15} /> Import Bills
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <table className="pur-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Reference</th>
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
                        <td className="pur-reference">{p.reference || "—"}</td>
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
                <strong>{(purchases || []).length}</strong> bills
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

export default Bills;
