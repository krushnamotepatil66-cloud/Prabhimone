import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreateCustomerForm from "../../components/Customer/CreateCustomerForm";
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
    const headers = [
      "Customer Name",
      "Company",
      "Email",
      "Phone",
      "City",
      "Receivables",
      "Total Billed"
    ];

    const rows = filteredCustomers.map((c) => [
      c.name,
      c.company || "",
      c.email,
      c.phone || "",
      c.city || "",
      getCustomerOutstanding(c.name),
      getCustomerBilled(c.name)
    ]);

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

  // Render Full-page Customer Creation/Edit View
  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreateCustomerForm
          editingCustomer={isEditing ? editingCustomer : null}
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
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingCustomer(null);
          }}
        />
      </DashboardLayout>
    );
  }

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
              onClick={handleExportCSV}
              title="Export Customers to CSV"
            >
              Export CSV
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
          <div className="table-card">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th width="40">
                    <input
                      type="checkbox"
                      checked={
                        currentCustomers.length > 0 &&
                        selected.length === currentCustomers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
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
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.includes(customer.id)}
                            onChange={(e) => handleSelect(e, customer.id)}
                          />
                        </td>
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
                Selected: {selected.length} of {filteredCustomers.length}
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

          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total Customers</h4>
              <h2>{totalCustomers}</h2>
            </div>
            <div className="summary-card">
              <h4>Active Billable</h4>
              <h2>{activeInvoicingCustomers}</h2>
            </div>
            <div className="summary-card">
              <h4>Total Receivables</h4>
              <h2 style={{ color: totalOutstanding > 0 ? "#ea4335" : "#10b981" }}>
                {settings.currency}
                {totalOutstanding.toLocaleString()}
              </h2>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Customers;