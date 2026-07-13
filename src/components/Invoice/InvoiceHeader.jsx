import { useState } from "react";
import { exportInvoicesToCSV } from "../../utils/exportInvoices";
import "./InvoiceHeader.css";

function InvoiceHeader({
  search,
  setSearch,
  status,
  setStatus,
  onCreate,
  invoices,
}) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = {
    All: "All Invoices",
    Paid: "Paid Invoices",
    Pending: "Pending Invoices",
    Overdue: "Overdue Invoices",
  };

  return (
    <div className="invoice-header">
      <div className="invoice-header-left">
        <div className="status-selector-container">
          <button
            className="status-selector-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <h2>{statusOptions[status] || "Invoices"}</h2>
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
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-buttons-group">
          <button
            type="button"
            className="primary-btn add-invoice-btn"
            onClick={onCreate}
          >
            + New Invoice
          </button>

          <button
            className="secondary-btn export-btn"
            onClick={() => exportInvoicesToCSV(invoices)}
            title="Export Invoices to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceHeader;