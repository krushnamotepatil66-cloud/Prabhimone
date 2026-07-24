import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import ItemModal from "../../components/Item/ItemModal";
import "./Items.css";

// Import Shared Layout and Component Styles from Invoices Page
import "../../components/Invoice/InvoiceTable.css";
import "../../components/Invoice/InvoiceHeader.css";
import "../../pages/dashboard/Invoices.css";
import "../../components/InvoiceSummary/InvoiceSummary.css";
import "../../pages/dashboard/Customers.css";

function Items() {
  const {
    items = [],
    products = [],
    settings,
    addItem,
    updateItem,
    deleteItem,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  const itemList = items.length > 0 ? items : products;
  const handleAdd = addItem || addProduct;
  const handleUpdate = updateItem || updateProduct;
  const handleDeleteItem = deleteItem || deleteProduct;

  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleExportCSV = () => {
    const headers = ["Type", "Item Name", "HSN/SAC", "Selling Price", "Purchase Price", "GST Rate (%)", "Unit", "Description"];
    const rows = itemList.map((p) => [
      `"${p.type || "Product"}"`,
      `"${p.name || ""}"`,
      `"${p.hsnSac || ""}"`,
      p.price || 0,
      p.purchasePrice || 0,
      p.tax !== undefined ? p.tax : 18,
      `"${p.unit || ""}"`,
      `"${p.description || ""}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Items.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        alert("Invalid CSV file.");
        return;
      }

      const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
      const typeIdx = headers.findIndex(h => h.includes("type"));
      const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("item") || h.includes("product"));
      const hsnIdx = headers.findIndex(h => h.includes("hsn") || h.includes("sac"));
      const priceIdx = headers.findIndex(h => h.includes("selling") || h.includes("price") || h.includes("rate"));
      const purchasePriceIdx = headers.findIndex(h => h.includes("purchase") || h.includes("cost"));
      const taxIdx = headers.findIndex(h => h.includes("gst") || h.includes("tax"));
      const unitIdx = headers.findIndex(h => h.includes("unit"));
      const descIdx = headers.findIndex(h => h.includes("desc"));

      if (nameIdx === -1) {
        alert("CSV must contain a column for 'Item Name' or 'Name'.");
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

        if (values[nameIdx]) {
          handleAdd({
            type: typeIdx !== -1 && values[typeIdx] ? values[typeIdx] : "Product",
            name: values[nameIdx],
            hsnSac: hsnIdx !== -1 && values[hsnIdx] ? values[hsnIdx] : "",
            price: priceIdx !== -1 && values[priceIdx] ? Number(values[priceIdx]) || 0 : 0,
            purchasePrice: purchasePriceIdx !== -1 && values[purchasePriceIdx] ? Number(values[purchasePriceIdx]) || 0 : 0,
            tax: taxIdx !== -1 && values[taxIdx] ? values[taxIdx] : "18",
            unit: unitIdx !== -1 && values[unitIdx] ? values[unitIdx] : "Nos",
            description: descIdx !== -1 && values[descIdx] ? values[descIdx] : ""
          });
          addedCount++;
        }
      }
      alert(`Import complete! ${addedCount} items successfully imported.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const rowsPerPage = 10;

  // Reset to page 1 if query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filter items based on search
  const filteredItems = itemList.filter((p) => {
    const name = p.name || "";
    const description = p.description || "";
    const type = p.type || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      type.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    return matchSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / rowsPerPage)
  );

  const start = (currentPage - 1) * rowsPerPage;
  const currentItems = filteredItems.slice(start, start + rowsPerPage);

  const totalItems = itemList.length;

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete item ${name}?`
    );
    if (!confirmDelete) return;

    handleDeleteItem(id);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsEditing(true);
  };

  return (
    <DashboardLayout>
      {/* Header matching Invoice Header exactly */}
      <div className="invoice-header">
        <div className="invoice-header-left">
          <div className="status-selector-container">
            <h2 style={{ fontSize: "24px", color: "#1e293b", margin: 0 }}>Items</h2>
          </div>
        </div>

        <div className="invoice-actions">
          <div className="search-bar-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search items..."
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
                setEditingItem(null);
                setIsCreating(true);
              }}
            >
              + New Item
            </button>

            <button
              className="secondary-btn export-btn"
              onClick={handleExportCSV}
              title="Export Items to CSV"
            >
              Export CSV
            </button>

            <label className="secondary-btn export-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: 0 }}>
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </div>

      {selectedItem ? (
        /* Full Width Details Preview Panel */
        <div className="invoice-full-preview-container">
          <div className="customer-details-drawer" style={{ width: "100%", position: "static", maxHeight: "none", boxShadow: "none" }}>
            <div className="drawer-header">
              <h3>Item Overview</h3>
              <button className="close-drawer-btn" onClick={() => setSelectedItem(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-avatar-card">
                <div className="large-avatar" style={{ background: "var(--primary)", color: "#fff" }}>
                  {selectedItem.name.charAt(0)}
                </div>
                <h2>{selectedItem.name}</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginTop: "6px" }}>
                  <span style={{
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: selectedItem.type === "Service" ? "#e0f2fe" : "#f3e8ff",
                    color: selectedItem.type === "Service" ? "#0284c7" : "#7e22ce"
                  }}>
                    {selectedItem.type || "Product"}
                  </span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    HSN / SAC: {selectedItem.hsnSac || "—"}
                  </span>
                </div>
              </div>

              <div className="drawer-info-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                <div className="info-block">
                  <label>Selling Price</label>
                  <p style={{ fontWeight: "700", color: "#059669" }}>
                    {settings.currency}{Number(selectedItem.price || 0).toLocaleString()}
                    <span style={{ fontSize: "11px", fontWeight: "normal", color: "#64748b", display: "block" }}>
                      ({selectedItem.salesTaxType || "With Tax"})
                    </span>
                  </p>
                </div>
                <div className="info-block">
                  <label>Purchase Price</label>
                  <p>
                    {selectedItem.purchasePrice ? `${settings.currency}${Number(selectedItem.purchasePrice).toLocaleString()}` : "—"}
                    {selectedItem.purchasePrice ? (
                      <span style={{ fontSize: "11px", fontWeight: "normal", color: "#64748b", display: "block" }}>
                        ({selectedItem.purchaseTaxType || "With Tax"})
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="info-block">
                  <label>Sales Discount</label>
                  <p>{selectedItem.discountOnSales ? `${selectedItem.discountOnSales}${selectedItem.discountType || "%"}` : "—"}</p>
                </div>
                <div className="info-block">
                  <label>GST Rate</label>
                  <p>{selectedItem.tax !== undefined && selectedItem.tax !== null && selectedItem.tax !== "" ? `${selectedItem.tax}%` : "—"}</p>
                </div>
                <div className="info-block">
                  <label>Unit</label>
                  <p>{selectedItem.unit || "—"}</p>
                </div>
              </div>

              <hr className="drawer-divider" />
              
              <h4>Description</h4>
              <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "14px" }}>
                {selectedItem.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Full width table & summary cards */
        <>
          {/* ── Summary Cards ── */}
          <div className="invoice-summary-cards">
            <div className="inv-summary-card total">
              <div className="inv-card-icon">📦</div>
              <div className="inv-card-body">
                <span className="inv-card-label">Total Items</span>
                <span className="inv-card-value">{totalItems}</span>
                <span className="inv-card-sub">Registered in system</span>
              </div>
            </div>
          </div>

          <div className="table-card">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>HSN / SAC</th>
                  <th>Unit</th>
                  <th style={{ textAlign: "right" }}>Selling Price</th>
                  <th style={{ textAlign: "right" }}>Purchase Price</th>
                  <th style={{ textAlign: "center" }}>GST %</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const isSelectedRow = selectedItem?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`invoice-row ${isSelectedRow ? "selected-row" : ""}`}
                        style={{ cursor: "pointer" }}
                      >

                        <td>
                          <div className="customer-avatar-name">
                            <span className="avatar-placeholder" style={{ background: "var(--gray-light)", color: "var(--gray-dark)", fontSize: "14px" }}>
                              {item.name.charAt(0)}
                            </span>
                            <div>
                              <div className="cust-name">{item.name}</div>
                              <span className="cust-city" style={{ color: "#94a3b8", fontSize: "12px" }}>
                                {item.description ? item.description.substring(0, 35) + (item.description.length > 35 ? "..." : "") : "No description"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: item.type === "Service" ? "#e0f2fe" : "#f3e8ff",
                            color: item.type === "Service" ? "#0284c7" : "#7e22ce"
                          }}>
                            {item.type || "Product"}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#475569", fontWeight: "500" }}>{item.hsnSac || "—"}</span>
                        </td>
                        <td>
                          <span style={{ color: "#64748b" }}>{item.unit || "—"}</span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                          {settings.currency}{Number(item.price || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", color: "#64748b" }}>
                          {item.purchasePrice ? `${settings.currency}${Number(item.purchasePrice).toLocaleString()}` : "—"}
                        </td>
                        <td style={{ textAlign: "center", color: "#475569", fontWeight: "500" }}>
                          {item.tax !== undefined && item.tax !== null && item.tax !== "" ? `${item.tax}%` : "—"}
                        </td>
                        <td className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit-btn"
                              onClick={(e) => handleEdit(item, e)}
                              title="Edit Item"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon delete-btn"
                              onClick={(e) => handleDelete(item.id, item.name, e)}
                              title="Delete Item"
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
                Total: {filteredItems.length} items
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

      {/* Item Modal Popup */}
      <ItemModal
        isOpen={isCreating || isEditing}
        editingItem={isEditing ? editingItem : null}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setEditingItem(null);
        }}
        onSave={(itemData) => {
          if (isEditing) {
            handleUpdate(itemData);
            if (selectedItem && selectedItem.id === itemData.id) {
              setSelectedItem(itemData);
            }
          } else {
            handleAdd(itemData);
          }
          setIsCreating(false);
          setIsEditing(false);
          setEditingItem(null);
        }}
      />
    </DashboardLayout>
  );
}

export default Items;
