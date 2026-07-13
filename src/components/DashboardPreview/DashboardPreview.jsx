import "./DashboardPreview.css";

function DashboardPreview() {
  return (
    <section className="dashboard-section">
      <div className="container">

        <h2 className="dashboard-title">
          Powerful Dashboard for Your Business
        </h2>

        <p className="dashboard-subtitle">
          Monitor invoices, payments, customers and business growth
          from one intuitive dashboard.
        </p>

        <div className="preview-dashboard-card">

          <aside className="preview-sidebar">
            <h3>InvoicePro</h3>

            <ul>
              <li className="active">Dashboard</li>
              <li>Invoices</li>
              <li>Customers</li>
              <li>Payments</li>
              <li>Reports</li>
              <li>Settings</li>
            </ul>
          </aside>

          <main className="preview-dashboard-content">

            <div className="preview-stats">

              <div className="preview-stat-card">
                <h4>Total Revenue</h4>
                <h2>₹2.4L</h2>
              </div>

              <div className="preview-stat-card">
                <h4>Invoices</h4>
                <h2>128</h2>
              </div>

              <div className="preview-stat-card">
                <h4>Customers</h4>
                <h2>57</h2>
              </div>

            </div>

            <div className="preview-invoice-table">

              <div className="preview-table-header">
                <span>Invoice</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              <div className="preview-table-row">
                <span>INV-1001</span>
                <span>₹25,000</span>
                <span className="preview-paid">Paid</span>
              </div>

              <div className="preview-table-row">
                <span>INV-1002</span>
                <span>₹12,500</span>
                <span className="preview-pending">Pending</span>
              </div>

              <div className="preview-table-row">
                <span>INV-1003</span>
                <span>₹18,000</span>
                <span className="preview-overdue">Overdue</span>
              </div>

            </div>

          </main>

        </div>

      </div>
    </section>
  );
}

export default DashboardPreview;