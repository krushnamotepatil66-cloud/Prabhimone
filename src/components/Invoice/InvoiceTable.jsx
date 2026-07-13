import { useState, useEffect } from "react";
import "./InvoiceTable.css";

function InvoiceTable({
  invoices,
  search,
  status,
  onEdit,
  onDelete,
  onView,
  activeInvoiceId,
}) {
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10; // Zoho standard list pages show more lines

  // Reset to page 1 if query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = invoice.customer || "";
    const id = invoice.id || "";

    const matchSearch =
      customer.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "All" || invoice.status === status;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / rowsPerPage)
  );

  const start = (currentPage - 1) * rowsPerPage;
  const currentInvoices = filteredInvoices.slice(start, start + rowsPerPage);

  const handleSelect = (e, id) => {
    e.stopPropagation(); // Stop row click trigger
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === currentInvoices.length) {
      setSelected([]);
    } else {
      setSelected(currentInvoices.map((item) => item.id));
    }
  };

  return (
    <div className="table-card">
      <table className="invoice-table">
        <thead>
          <tr>
            <th width="40">
              <input
                type="checkbox"
                checked={
                  currentInvoices.length > 0 &&
                  selected.length === currentInvoices.length
                }
                onChange={handleSelectAll}
              />
            </th>
            <th>Date</th>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th style={{ textAlign: "right" }}>Balance Due</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentInvoices.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">
                No invoices found.
              </td>
            </tr>
          ) : (
            currentInvoices.map((invoice) => {
              const isSelectedRow = invoice.id === activeInvoiceId;
              const numericAmount = parseAmount(invoice.amount);
              const balanceDue = invoice.status === "Paid" ? 0 : numericAmount;

              return (
                <tr
                  key={invoice.id}
                  onClick={() => onView(invoice)}
                  className={`invoice-row ${isSelectedRow ? "selected-row" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(invoice.id)}
                      onChange={(e) => handleSelect(e, invoice.id)}
                    />
                  </td>
                  <td>{invoice.date}</td>
                  <td className="invoice-id-cell">{invoice.id}</td>
                  <td className="customer-name-cell">{invoice.customer}</td>
                  <td>
                    <span className={`invoice-badge ${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                    {invoice.amount}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "600", color: balanceDue > 0 ? "#ea4335" : "#64748b" }}>
                    ₹{balanceDue.toLocaleString()}
                  </td>
                  <td className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit-btn"
                        onClick={() => onEdit(invoice)}
                        title="Edit Invoice"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete-btn"
                        onClick={() => onDelete(invoice.id)}
                        title="Delete Invoice"
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
          Selected: {selected.length} of {filteredInvoices.length}
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
  );
}

export default InvoiceTable;