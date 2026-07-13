import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import CreateExpenseForm from "../../components/DashboardHome/CreateExpenseForm";
import "./Expenses.css";

function Expenses() {
  const { expenses, addExpense, deleteExpense, settings } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Monitor Query Parameters for dashboard redirects (?action=new)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete expense ${id}?`);
    if (confirmDelete) {
      deleteExpense(id);
    }
  };

  const handleSaveExpense = (expenseData) => {
    addExpense(expenseData);
    setIsCreating(false);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch =
      exp.category.toLowerCase().includes(search.toLowerCase()) ||
      (exp.customerName && exp.customerName.toLowerCase().includes(search.toLowerCase()));

    const matchFilter = filter === "All" || exp.status === filter;

    return matchSearch && matchFilter;
  });

  const formatCurrency = (amount) => {
    return `${settings.currency || "₹"}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isCreating) {
    return (
      <DashboardLayout>
        <CreateExpenseForm
          onSave={handleSaveExpense}
          onCancel={() => setIsCreating(false)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="expenses-page">
        {/* Header Block */}
        <div className="expenses-header">
          <div>
            <h1>Expenses</h1>
            <p className="subtitle">Track and manage business costs and billable client tasks.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-bar-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search category or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button className="primary-btn add-expense-btn" onClick={() => setIsCreating(true)}>
              + Record Expense
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <button
            className={`filter-btn ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === "Billable" ? "active" : ""}`}
            onClick={() => setFilter("Billable")}
          >
            Billable
          </button>
          <button
            className={`filter-btn ${filter === "Non-Billable" ? "active" : ""}`}
            onClick={() => setFilter("Non-Billable")}
          >
            Non-Billable
          </button>
        </div>

        {/* Expenses List Table */}
        <div className="table-card">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense ID</th>
                <th>Category</th>
                <th>Customer Name</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td className="expense-id-cell">{exp.id}</td>
                    <td className="category-cell">{exp.category}</td>
                    <td>{exp.customerName || <span className="none-text">-</span>}</td>
                    <td>
                      <span className={`status-badge badge-${exp.status.toLowerCase()}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                      {formatCurrency(exp.amount)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="delete-icon-btn"
                        onClick={() => handleDelete(exp.id)}
                        title="Delete Expense"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Expenses;
