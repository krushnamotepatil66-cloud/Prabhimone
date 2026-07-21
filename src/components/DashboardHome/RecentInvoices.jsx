import { useApp } from "../../context/AppContext";
import "./RecentInvoices.css";

function RecentInvoices() {
  const { invoices } = useApp();

  const recent = invoices.slice(0, 5);

  return (
    <div className="zoho-card recent-invoices-card">
      <div className="zoho-card-header">
        <h4 className="zoho-card-title">Recent Invoices</h4>
      </div>

      <div className="recent-invoices-table-container">
        <table className="recent-invoices-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  No invoices found
                </td>
              </tr>
            ) : (
              recent.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-id">{invoice.id}</td>
                  <td>{invoice.customer}</td>
                  <td className="invoice-amount">{invoice.amount}</td>
                  <td>
                    <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentInvoices;