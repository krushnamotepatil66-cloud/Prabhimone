import { useState } from "react";
import { useApp } from "../../context/AppContext";
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
  const { addInvoice } = useApp();
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
          
          <label className="secondary-btn export-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: 0 }}>
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target.result;
                  const lines = text.split(/\r?\n/);
                  if (lines.length < 2) {
                    alert("Invalid CSV file. File must contain at least headers and one row.");
                    return;
                  }

                  const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
                  
                  const idIdx = headers.findIndex(h => h === "id" || h.includes("invoice"));
                  const customerIdx = headers.findIndex(h => h.includes("customer") || h === "name");
                  const amountIdx = headers.findIndex(h => h.includes("amount") || h.includes("total"));
                  const statusIdx = headers.findIndex(h => h.includes("status"));
                  const dateIdx = headers.findIndex(h => h.includes("date"));

                  if (customerIdx === -1) {
                    alert("CSV must contain a column for 'Customer' or 'Name'.");
                    return;
                  }

                  let addedCount = 0;
                  for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = [];
                    let currentVal = "";
                    let inQuotes = false;
                    for (let j = 0; j < line.length; j++) {
                      const char = line[j];
                      if (char === '"') {
                        inQuotes = !inQuotes;
                      } else if (char === ',' && !inQuotes) {
                        values.push(currentVal.replace(/^["']|["']$/g, "").trim());
                        currentVal = "";
                      } else {
                        currentVal += char;
                      }
                    }
                    values.push(currentVal.replace(/^["']|["']$/g, "").trim());

                    if (values[customerIdx]) {
                      const newInv = {
                        id: idIdx !== -1 && values[idIdx] ? values[idIdx] : `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        customer: values[customerIdx],
                        amount: amountIdx !== -1 && values[amountIdx] ? values[amountIdx] : "₹0.00",
                        status: statusIdx !== -1 && values[statusIdx] ? values[statusIdx] : "Pending",
                        date: dateIdx !== -1 && values[dateIdx] ? values[dateIdx] : new Date().toISOString().split("T")[0],
                        items: [{ product: "Imported Service", qty: 1, price: 0 }]
                      };
                      addInvoice(newInv);
                      addedCount++;
                    }
                  }
                  alert(`Import complete! ${addedCount} invoices successfully imported.`);
                };
                reader.readAsText(file);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default InvoiceHeader;