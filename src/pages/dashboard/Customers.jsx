import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CustomerModal from "../../components/Customer/CustomerModal";
import "./Customers.css";

// Import Shared Layout and Component Styles from Invoices Page
import "../../components/Invoice/InvoiceTable.css";
import "../../components/Invoice/InvoiceHeader.css";
import "../../pages/dashboard/Invoices.css";
import "../../components/InvoiceSummary/InvoiceSummary.css";

function Customers() {
  const {
    customers,
    invoices,
    settings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useApp();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showIEDrawer, setShowIEDrawer] = useState(false);
  const [ieDrawerTab, setIEDrawerTab] = useState("export"); // "import" or "export"
  const [exportColumns, setExportColumns] = useState({
    name: true,
    company: true,
    email: true,
    phone: true,
    city: true,
    receivables: true,
    totalBilled: true,
  });

  const rowsPerPage = 10;

  // Reset to page 1 if query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const statusOptions = {
    All: "All Customers",
    Active: "Active Customers",
    Outstanding: "With Outstanding Balance",
  };

  // Helper to parse amount strings
  const parseAmount = (amtStr) => {
    return Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;
  };

  // Helper to calculate outstanding balance for a customer name
  const getCustomerOutstanding = (customerName) => {
    return invoices
      .filter((inv) => inv.customer === customerName && inv.status !== "Paid")
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  };

  // Helper to calculate total billed for a customer name
  const getCustomerBilled = (customerName) => {
    return invoices
      .filter((inv) => inv.customer === customerName)
      .reduce((sum, inv) => sum + parseAmount(inv.amount), 0);
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((c) => {
    const name = c.name || "";
    const email = c.email || "";
    const company = c.company || "";
    const city = c.city || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase());

    const hasOutstanding = getCustomerOutstanding(c.name) > 0;
    const isActive = invoices.some((inv) => inv.customer === c.name);

    let matchStatus = true;
    if (status === "Active") {
      matchStatus = isActive;
    } else if (status === "Outstanding") {
      matchStatus = hasOutstanding;
    }

    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / rowsPerPage)
  );

  const start = (currentPage - 1) * rowsPerPage;
  const currentCustomers = filteredCustomers.slice(start, start + rowsPerPage);

  const handleSelect = (e, id) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === currentCustomers.length) {
      setSelected([]);
    } else {
      setSelected(currentCustomers.map((item) => item.id));
    }
  };

  const handleExportCSV = () => {
    const headers = [];
    if (exportColumns.name) headers.push("Customer Name");
    if (exportColumns.company) headers.push("Company");
    if (exportColumns.email) headers.push("Email");
    if (exportColumns.phone) headers.push("Phone");
    if (exportColumns.city) headers.push("City");
    if (exportColumns.receivables) headers.push("Receivables");
    if (exportColumns.totalBilled) headers.push("Total Billed");

    const rows = filteredCustomers.map((c) => {
      const row = [];
      if (exportColumns.name) row.push(c.name);
      if (exportColumns.company) row.push(c.company || "");
      if (exportColumns.email) row.push(c.email);
      if (exportColumns.phone) row.push(c.phone || "");
      if (exportColumns.city) row.push(c.city || "");
      if (exportColumns.receivables) row.push(getCustomerOutstanding(c.name));
      if (exportColumns.totalBilled) row.push(getCustomerBilled(c.name));
      return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Customers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowIEDrawer(false);
  };

  const handleImportCSV = (e) => {
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

      // Parse headers
      const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
      
      const nameIdx = headers.findIndex(h => h.includes("name") || h === "customer");
      const emailIdx = headers.findIndex(h => h.includes("email"));
      const phoneIdx = headers.findIndex(h => h.includes("phone") || h === "mobile");
      const companyIdx = headers.findIndex(h => h.includes("company") || h === "business");
      const cityIdx = headers.findIndex(h => h.includes("city"));
      const addressIdx = headers.findIndex(h => h.includes("address") || h.includes("billing"));

      if (nameIdx === -1) {
        alert("CSV must contain a column for 'Customer Name' or 'Name'.");
        return;
      }

      let addedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Comma-separated parsing helper (handling quoted fields)
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

        if (values[nameIdx]) {
          const newCust = {
            id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: values[nameIdx],
            email: emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : `${values[nameIdx].toLowerCase().replace(/\s+/g, '')}@example.com`,
            phone: phoneIdx !== -1 && values[phoneIdx] ? values[phoneIdx] : "",
            company: companyIdx !== -1 && values[companyIdx] ? values[companyIdx] : "",
            city: cityIdx !== -1 && values[cityIdx] ? values[cityIdx] : "",
            address: addressIdx !== -1 && values[addressIdx] ? values[addressIdx] : "",
          };
          addCustomer(newCust);
          addedCount++;
        }
      }
      
      alert(`Import complete! ${addedCount} customer records successfully imported.`);
      setShowIEDrawer(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Calculate high-level stats
  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + getCustomerOutstanding(c.name),
    0
  );
  const activeInvoicingCustomers = customers.filter(
    (c) => invoices.some((inv) => inv.customer === c.name)
  ).length;



  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete customer ${name}? All billing connection records will remain.`
    );
    if (!confirmDelete) return;

    deleteCustomer(id);
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(null);
    }
  };

  const handleEdit = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setIsEditing(true);
  };

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
              <h2>{statusOptions[status] || "Customers"}</h2>
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
              placeholder="Search customers..."
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
                setEditingCustomer(null);
                setIsCreating(true);
              }}
            >
              + New Customer
            </button>

            <button
              className="secondary-btn export-btn"
              onClick={() => {
                setShowIEDrawer(true);
                setIEDrawerTab("export");
              }}
              title="Export Customers via CSV"
            >
              Export CSV
            </button>

            <button
              className="secondary-btn export-btn"
              onClick={() => {
                setShowIEDrawer(true);
                setIEDrawerTab("import");
              }}
              title="Import Customers via CSV"
            >
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {selectedCustomer ? (
        /* Full Width Details Preview Panel */
        <div className="invoice-full-preview-container">
          <div className="customer-details-drawer" style={{ width: "100%", position: "static", maxHeight: "none", boxShadow: "none" }}>
            <div className="drawer-header">
              <h3>Customer Overview</h3>
              <button className="close-drawer-btn" onClick={() => setSelectedCustomer(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-avatar-card">
                <div className="large-avatar">{selectedCustomer.name.charAt(0)}</div>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.company || "No Company Specified"}</p>
              </div>

              <div className="drawer-info-grid">
                <div className="info-block">
                  <label>Email</label>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div className="info-block">
                  <label>Phone</label>
                  <p>{selectedCustomer.phone || "—"}</p>
                </div>
                <div className="info-block">
                  <label>Address</label>
                  <p>{selectedCustomer.address || "—"}</p>
                </div>
                <div className="info-block">
                  <label>City</label>
                  <p>{selectedCustomer.city || "—"}</p>
                </div>
              </div>

              <hr className="drawer-divider" />

              <h4>Financial Overview</h4>
              <div className="drawer-financials">
                <div className="fin-box">
                  <span>Billed Total</span>
                  <strong>
                    {settings.currency}
                    {getCustomerBilled(selectedCustomer.name).toLocaleString()}
                  </strong>
                </div>
                <div className="fin-box outstanding">
                  <span>Receivables</span>
                  <strong>
                    {settings.currency}
                    {getCustomerOutstanding(selectedCustomer.name).toLocaleString()}
                  </strong>
                </div>
              </div>

              <hr className="drawer-divider" />

              <h4>Invoices ({invoices.filter((i) => i.customer === selectedCustomer.name).length})</h4>
              <div className="drawer-invoices-list">
                {invoices.filter((i) => i.customer === selectedCustomer.name).length === 0 ? (
                  <p className="no-invoices">No billing history found.</p>
                ) : (
                  invoices
                    .filter((i) => i.customer === selectedCustomer.name)
                    .map((inv) => (
                      <div key={inv.id} className="drawer-invoice-card">
                        <div>
                          <strong>{inv.id}</strong>
                          <small>{inv.date}</small>
                        </div>
                        <div>
                          <strong>{inv.amount}</strong>
                          <span className={`status-badge-small ${inv.status.toLowerCase()}`}>
                            {inv.status}
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
                <span className="inv-card-label">Total Customers</span>
                <span className="inv-card-value">{totalCustomers}</span>
                <span className="inv-card-sub">Registered in system</span>
              </div>
            </div>

            <div className="inv-summary-card paid">
              <div className="inv-card-icon">✅</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Active Billable</span>
                <span className="inv-card-value">{activeInvoicingCustomers}</span>
                <span className="inv-card-sub">With billing history</span>
              </div>
            </div>

            <div className="inv-summary-card outstanding">
              <div className="inv-card-icon">⏳</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Total Receivables</span>
                <span className="inv-card-value">{settings.currency}{totalOutstanding.toLocaleString()}</span>
                <span className="inv-card-sub">{totalOutstanding > 0 ? "Pending collection" : "All cleared"}</span>
              </div>
            </div>
          </div>

          <div className="table-card">
            <table className="invoice-table">
              <thead>
                <tr>

                  <th>Customer</th>
                  <th>Company</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: "right" }}>Outstanding Receivables</th>
                  <th style={{ textAlign: "right" }}>Total Billed</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer) => {
                    const outstanding = getCustomerOutstanding(customer.name);
                    const billed = getCustomerBilled(customer.name);
                    const isSelectedRow = selectedCustomer?.id === customer.id;

                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`invoice-row ${isSelectedRow ? "selected-row" : ""}`}
                        style={{ cursor: "pointer" }}
                      >

                        <td>
                          <div className="customer-avatar-name">
                            <span className="avatar-placeholder">
                              {customer.name.charAt(0)}
                            </span>
                            <div>
                              <div className="cust-name">{customer.name}</div>
                              <span className="cust-city">{customer.city || "Unknown City"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{customer.company || "—"}</td>
                        <td>
                          <div className="contact-details-sub">
                            <div>{customer.email}</div>
                            <small>{customer.phone || "No phone"}</small>
                          </div>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: outstanding > 0 ? "#ea4335" : "#64748b" }}>
                          {settings.currency}{outstanding.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                          {settings.currency}{billed.toLocaleString()}
                        </td>
                        <td className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit-btn"
                              onClick={(e) => handleEdit(customer, e)}
                              title="Edit Customer"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon delete-btn"
                              onClick={(e) => handleDelete(customer.id, customer.name, e)}
                              title="Delete Customer"
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
                Total: {filteredCustomers.length} customers
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

      {/* Customer Modal Popup */}
      <CustomerModal
        isOpen={isCreating || isEditing}
        editingCustomer={isEditing ? editingCustomer : null}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setEditingCustomer(null);
        }}
        onSave={(cust) => {
          if (isEditing) {
            updateCustomer(cust);
            // Update selectedCustomer detail view if active
            if (selectedCustomer && selectedCustomer.id === cust.id) {
              setSelectedCustomer(cust);
            }
          } else {
            addCustomer(cust);
          }
          setIsCreating(false);
          setIsEditing(false);
          setEditingCustomer(null);
        }}
      />
      {/* Import / Export Slider Drawer */}
      {showIEDrawer && (
        <div className="ie-drawer-overlay" onClick={() => setShowIEDrawer(false)}>
          <div className="ie-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ie-drawer-header">
              <h3>Import / Export Customers</h3>
              <button className="ie-close-btn" onClick={() => setShowIEDrawer(false)}>✕</button>
            </div>

            <div className="ie-drawer-tabs">
              <button
                className={`ie-tab-btn ${ieDrawerTab === "import" ? "active" : ""}`}
                onClick={() => setIEDrawerTab("import")}
              >
                Import CSV
              </button>
              <button
                className={`ie-tab-btn ${ieDrawerTab === "export" ? "active" : ""}`}
                onClick={() => setIEDrawerTab("export")}
              >
                Export CSV
              </button>
            </div>

            {ieDrawerTab === "import" ? (
              <div className="ie-drawer-body">
                <p className="ie-section-desc">
                  Import customer records from a CSV file. The CSV file must include a header row containing at least a <strong>Customer Name</strong> or <strong>Name</strong> column.
                </p>
                <label className="ie-upload-zone" htmlFor="csv-file-input">
                  <span className="ie-upload-icon">📥</span>
                  <span className="ie-upload-text">Choose CSV File</span>
                  <span className="ie-upload-subtext">Click here to browse your files</span>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            ) : (
              <div className="ie-drawer-body">
                <p className="ie-section-desc">
                  Select which columns you want to include in the exported CSV spreadsheet.
                </p>
                <div className="ie-columns-config">
                  <span className="ie-columns-config-title">Configure Columns</span>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.name}
                      onChange={(e) => setExportColumns({ ...exportColumns, name: e.target.checked })}
                    />
                    Customer Name
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.company}
                      onChange={(e) => setExportColumns({ ...exportColumns, company: e.target.checked })}
                    />
                    Company / Organization
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.email}
                      onChange={(e) => setExportColumns({ ...exportColumns, email: e.target.checked })}
                    />
                    Email Address
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.phone}
                      onChange={(e) => setExportColumns({ ...exportColumns, phone: e.target.checked })}
                    />
                    Phone Number
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.city}
                      onChange={(e) => setExportColumns({ ...exportColumns, city: e.target.checked })}
                    />
                    City
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.receivables}
                      onChange={(e) => setExportColumns({ ...exportColumns, receivables: e.target.checked })}
                    />
                    Receivables
                  </label>
                  <label className="ie-checkbox-label">
                    <input
                      type="checkbox"
                      checked={exportColumns.totalBilled}
                      onChange={(e) => setExportColumns({ ...exportColumns, totalBilled: e.target.checked })}
                    />
                    Total Billed
                  </label>
                </div>
              </div>
            )}

            <div className="ie-drawer-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowIEDrawer(false)}
                style={{ border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", color: "#475569" }}
              >
                Cancel
              </button>
              {ieDrawerTab === "export" && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleExportCSV}
                  style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600" }}
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Customers;