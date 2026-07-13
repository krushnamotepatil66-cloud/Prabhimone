import { useApp } from "../../context/AppContext";
import "./RecentInvoices.css";

function RecentInvoices() {
  const { invoices } = useApp();

  const recent = invoices.slice(0, 5);

  return (
    <div className="recent-invoices">
      <h2>Recent Invoices</h2>

      <table>
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
                <td>{invoice.id}</td>
                <td>{invoice.customer}</td>
                <td>{invoice.amount}</td>
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
  );
}

export default RecentInvoices;