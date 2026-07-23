import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import ProductModal from "../../components/Product/ProductModal";
import "./Products.css";

// Import Shared Layout and Component Styles from Invoices Page
import "../../components/Invoice/InvoiceTable.css";
import "../../components/Invoice/InvoiceHeader.css";
import "../../pages/dashboard/Invoices.css";
import "../../components/InvoiceSummary/InvoiceSummary.css";
import "../../pages/dashboard/Customers.css";

function Products() {
  const {
    products,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleExportCSV = () => {
    const headers = ["Product Name", "HSN/SAC", "Selling Price", "Unit", "Description"];
    const rows = products.map((p) => [
      `"${p.name || ""}"`,
      `"${p.hsnSac || ""}"`,
      p.price || 0,
      `"${p.unit || ""}"`,
      `"${p.description || ""}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Products.csv");
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
      const nameIdx = headers.findIndex(h => h.includes("name") || h === "product");
      const hsnIdx = headers.findIndex(h => h.includes("hsn") || h.includes("sac"));
      const priceIdx = headers.findIndex(h => h.includes("price") || h.includes("rate"));
      const unitIdx = headers.findIndex(h => h.includes("unit"));
      const descIdx = headers.findIndex(h => h.includes("desc"));

      if (nameIdx === -1) {
        alert("CSV must contain a column for 'Product Name' or 'Name'.");
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
          addProduct({
            name: values[nameIdx],
            hsnSac: hsnIdx !== -1 && values[hsnIdx] ? values[hsnIdx] : "",
            price: priceIdx !== -1 && values[priceIdx] ? Number(values[priceIdx]) || 0 : 0,
            unit: unitIdx !== -1 && values[unitIdx] ? values[unitIdx] : "Nos",
            description: descIdx !== -1 && values[descIdx] ? values[descIdx] : ""
          });
          addedCount++;
        }
      }
      alert(`Import complete! ${addedCount} products successfully imported.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const rowsPerPage = 10;

  // Reset to page 1 if query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filter products based on search
  const filteredProducts = products.filter((p) => {
    const name = p.name || "";
    const description = p.description || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    return matchSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / rowsPerPage)
  );

  const start = (currentPage - 1) * rowsPerPage;
  const currentProducts = filteredProducts.slice(start, start + rowsPerPage);

  const handleSelect = (e, id) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === currentProducts.length) {
      setSelected([]);
    } else {
      setSelected(currentProducts.map((item) => item.id));
    }
  };

  // Calculate high-level stats
  const totalProducts = products.length;

  const handleDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete product ${name}?`
    );
    if (!confirmDelete) return;

    deleteProduct(id);
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const handleEdit = (product, e) => {
    e.stopPropagation();
    setEditingProduct(product);
    setIsEditing(true);
  };

  return (
    <DashboardLayout>
      {/* Header matching Invoice Header exactly */}
      <div className="invoice-header">
        <div className="invoice-header-left">
          <div className="status-selector-container">
            <h2 style={{ fontSize: "24px", color: "#1e293b", margin: 0 }}>Products</h2>
          </div>
        </div>

        <div className="invoice-actions">
          <div className="search-bar-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
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
                setEditingProduct(null);
                setIsCreating(true);
              }}
            >
              + New Product
            </button>

            <button
              className="secondary-btn export-btn"
              onClick={handleExportCSV}
              title="Export Products to CSV"
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

      {selectedProduct ? (
        /* Full Width Details Preview Panel */
        <div className="invoice-full-preview-container">
          <div className="customer-details-drawer" style={{ width: "100%", position: "static", maxHeight: "none", boxShadow: "none" }}>
            <div className="drawer-header">
              <h3>Product Overview</h3>
              <button className="close-drawer-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-avatar-card">
                <div className="large-avatar" style={{ background: "var(--primary)", color: "#fff" }}>
                  {selectedProduct.name.charAt(0)}
                </div>
                <h2>{selectedProduct.name}</h2>
                <p>HSN / SAC: {selectedProduct.hsnSac || "—"}</p>
              </div>

              <div className="drawer-info-grid">
                <div className="info-block">
                  <label>Price</label>
                  <p>{settings.currency}{Number(selectedProduct.price).toLocaleString()}</p>
                </div>
                <div className="info-block">
                  <label>Unit</label>
                  <p>{selectedProduct.unit || "—"}</p>
                </div>
              </div>

              <hr className="drawer-divider" />
              
              <h4>Description</h4>
              <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "14px" }}>
                {selectedProduct.description || "No description provided."}
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
                <span className="inv-card-value">{totalProducts}</span>
                <span className="inv-card-sub">Registered in system</span>
              </div>
            </div>
          </div>

          <div className="table-card">
            <table className="invoice-table">
              <thead>
                <tr>

                  <th>Product</th>
                  <th>HSN / SAC</th>
                  <th>Unit</th>
                  <th style={{ textAlign: "right" }}>Price (₹)</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => {
                    const isSelectedRow = selectedProduct?.id === product.id;

                    return (
                      <tr
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`invoice-row ${isSelectedRow ? "selected-row" : ""}`}
                        style={{ cursor: "pointer" }}
                      >

                        <td>
                          <div className="customer-avatar-name">
                            <span className="avatar-placeholder" style={{ background: "var(--gray-light)", color: "var(--gray-dark)", fontSize: "14px" }}>
                              {product.name.charAt(0)}
                            </span>
                            <div>
                              <div className="cust-name">{product.name}</div>
                              <span className="cust-city" style={{ color: "#94a3b8", fontSize: "12px" }}>
                                {product.description ? product.description.substring(0, 40) + (product.description.length > 40 ? "..." : "") : "No description"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: "#475569", fontWeight: "500" }}>{product.hsnSac || "—"}</span>
                        </td>
                        <td>
                          <span style={{ color: "#64748b" }}>{product.unit || "—"}</span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                          {settings.currency}{Number(product.price).toLocaleString()}
                        </td>
                        <td className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit-btn"
                              onClick={(e) => handleEdit(product, e)}
                              title="Edit Product"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon delete-btn"
                              onClick={(e) => handleDelete(product.id, product.name, e)}
                              title="Delete Product"
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
                Total: {filteredProducts.length} products
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

      {/* Product Modal Popup */}
      <ProductModal
        isOpen={isCreating || isEditing}
        editingProduct={isEditing ? editingProduct : null}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setEditingProduct(null);
        }}
        onSave={(prod) => {
          if (isEditing) {
            updateProduct(prod);
            // Update selectedProduct detail view if active
            if (selectedProduct && selectedProduct.id === prod.id) {
              setSelectedProduct(prod);
            }
          } else {
            addProduct(prod);
          }
          setIsCreating(false);
          setIsEditing(false);
          setEditingProduct(null);
        }}
      />
    </DashboardLayout>
  );
}

export default Products;
