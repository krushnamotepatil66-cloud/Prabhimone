import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useApp } from "../../context/AppContext";
import RecordPaymentForm from "../../components/Payment/RecordPaymentForm";
import "./Payments.css";

function Payments() {
  const { payments, addPayment, deletePayment, settings } = useApp();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Monitor Query Parameters for redirections (?action=new)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Filter payments based on search
  const filteredPayments = payments.filter(
    (p) =>
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate high-level stats
  const totalCollections = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paymentCount = payments.length;

  const handleDelete = (id, invoiceId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete payment ${id}? This will revert invoice ${invoiceId} status back to Pending.`
    );
    if (confirmDelete) {
      deletePayment(id);
    }
  };

  const handleSavePayment = (paymentData) => {
    addPayment(paymentData);
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <DashboardLayout>
        <RecordPaymentForm
          onSave={handleSavePayment}
          onCancel={() => setIsCreating(false)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="payments-page">
        <div className="payments-header">
          <div>
            <h1>Payments Received</h1>
            <p className="subtitle">Log customer payments, track billing receipts, and monitor collections.</p>
          </div>
          <button className="record-payment-btn" onClick={() => setIsCreating(true)}>
            + Record Payment
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card-mini">
            <p>Total Collections</p>
            <h2 className="positive-collected">
              {settings.currency}
              {totalCollections.toLocaleString()}
            </h2>
          </div>
          <div className="stat-card-mini">
            <p>Payments Logged</p>
            <h2>{paymentCount} Receipts</h2>
          </div>
        </div>

        {/* Controls */}
        <div className="table-controls">
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by customer, invoice ID, payment mode, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Ledger Table */}
        <div className="payments-table-container">
          <table className="payments-list-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Reference #</th>
                <th>Amount Received</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No payment history recorded.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="payment-row-item">
                    <td>
                      <strong>{payment.id}</strong>
                    </td>
                    <td>{payment.date}</td>
                    <td>
                      <span className="invoice-link">{payment.invoiceId}</span>
                    </td>
                    <td>
                      <strong>{payment.customerName}</strong>
                    </td>
                    <td>
                      <span className="method-pill">{payment.method}</span>
                    </td>
                    <td className="reference-cell">{payment.reference || "—"}</td>
                    <td className="amount-received">
                      {settings.currency}
                      {Number(payment.amount).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="delete-action-btn"
                        onClick={() => handleDelete(payment.id, payment.invoiceId)}
                      >
                        Delete
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

export default Payments;