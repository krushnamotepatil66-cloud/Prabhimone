import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreateExpenseForm from "../../components/DashboardHome/CreateExpenseForm";
import { FiSearch, FiTrash2, FiPlusCircle, FiTag, FiDollarSign, FiList } from "react-icons/fi";
import "./Expenses.css";

function Expenses() {
  const { expenses, addExpense, deleteExpense, settings } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");
    setIsCreating(action === "new");
  }, [searchParams]);

  const handleOpenCreate = () => setSearchParams({ action: "new" });

  const handleCloseCreate = () => {
    if (searchParams.get("action") === "new") {
      setSearchParams({});
    } else {
      setIsCreating(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete expense ${id}? This cannot be undone.`)) {
      deleteExpense(id);
    }
  };

  const handleSaveExpense = (expenseData) => {
    addExpense(expenseData);
    handleCloseCreate();
  };

  const cur = settings.currency || "₹";

  const formatCurrency = (amount) =>
    `${cur}${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch =
      (exp.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (exp.customerName && exp.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (exp.id && exp.id.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "All" || exp.status === filter;
    return matchSearch && matchFilter;
  });

  // Summary stats
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const billableCount = expenses.filter((e) => e.status === "Billable").length;
  const totalCount = expenses.length;

  if (isCreating) {
    return (
      <DashboardLayout>
        <CreateExpenseForm onSave={handleSaveExpense} onCancel={handleCloseCreate} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="exp-page">

        {/* ── Page Header ── */}
        <div className="exp-header">
          <div className="exp-header-text">
            <h1>Expenses</h1>
            <p>Track and manage business costs and billable client expenses.</p>
          </div>
          <button className="exp-record-btn" onClick={handleOpenCreate}>
            <FiPlusCircle size={16} />
            Record Expense
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="exp-stats-row">
          <div className="exp-stat-card">
            <div className="exp-stat-icon blue"><FiList size={20} /></div>
            <div>
              <div className="exp-stat-value">{totalCount}</div>
              <div className="exp-stat-label">Total Expenses</div>
            </div>
          </div>
          <div className="exp-stat-card">
            <div className="exp-stat-icon green"><FiDollarSign size={20} /></div>
            <div>
              <div className="exp-stat-value">{formatCurrency(totalAmount)}</div>
              <div className="exp-stat-label">Total Spent</div>
            </div>
          </div>
          <div className="exp-stat-card">
            <div className="exp-stat-icon purple"><FiTag size={20} /></div>
            <div>
              <div className="exp-stat-value">{billableCount}</div>
              <div className="exp-stat-label">Billable Expenses</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search + Filters ── */}
        <div className="exp-toolbar">
          <div className="exp-search-wrap">
            <FiSearch className="exp-search-icon" size={15} />
            <input
              type="text"
              placeholder="Search by category, customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="exp-search-input"
            />
          </div>
          <div className="exp-filter-tabs">
            {["All", "Billable", "Non-Billable"].map((tab) => (
              <button
                key={tab}
                className={`exp-filter-tab ${filter === tab ? "active" : ""}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="exp-table-card">
          {filteredExpenses.length === 0 ? (
            <div className="exp-empty-state">
              <div className="exp-empty-icon">📋</div>
              <p className="exp-empty-title">No expenses found</p>
              <p className="exp-empty-sub">
                {search ? `No results for "${search}"` : "Record your first expense to get started."}
              </p>
              {!search && (
                <button className="exp-record-btn" onClick={handleOpenCreate}>
                  <FiPlusCircle size={15} /> Record Expense
                </button>
              )}
            </div>
          ) : (
            <table className="exp-table">
              <thead>
                <tr>
                  <th>Expense ID</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Customer</th>
                  <th>GST</th>
                  <th>Status</th>
                  <th className="align-right">Amount</th>
                  <th className="align-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="exp-table-row">
                    <td>
                      <span className="exp-id-badge">{exp.id}</span>
                    </td>
                    <td className="exp-date">{exp.date}</td>
                    <td>
                      <div className="exp-category-cell">
                        <span className="exp-category-dot" />
                        <span className="exp-category-name">{exp.category}</span>
                      </div>
                    </td>
                    <td className="exp-customer">
                      {exp.customerName ? (
                        <span className="exp-customer-name">{exp.customerName}</span>
                      ) : (
                        <span className="exp-none">—</span>
                      )}
                    </td>
                    <td className="exp-gst">
                      {exp.gstRate && Number(exp.gstRate) > 0 ? (
                        <span className="exp-gst-badge">{exp.gstRate}%</span>
                      ) : (
                        <span className="exp-none">Nil</span>
                      )}
                    </td>
                    <td>
                      <span className={`exp-status-chip ${exp.status === "Billable" ? "chip-billable" : "chip-nonbillable"}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="exp-amount align-right">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="align-center">
                      <button
                        className="exp-delete-btn"
                        onClick={() => handleDelete(exp.id)}
                        title="Delete Expense"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {filteredExpenses.length > 0 && (
            <div className="exp-table-footer">
              Showing <strong>{filteredExpenses.length}</strong> of <strong>{totalCount}</strong> expenses
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Expenses;
