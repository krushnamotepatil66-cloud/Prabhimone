import "./InvoiceSummary.css";

function InvoiceSummary({ invoices }) {

  const totalInvoices = invoices.length;

  const paid = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;

  const pending = invoices.filter(
    (invoice) => invoice.status === "Pending"
  ).length;

  const revenue = invoices.reduce((sum, invoice) => {
    const amount = Number(
      String(invoice.amount).replace(/[₹,]/g, "")
    );
    return sum + amount;
  }, 0);

  const cards = [
    {
      title: "Total Invoices",
      value: totalInvoices,
    },
    {
      title: "Paid",
      value: paid,
    },
    {
      title: "Pending",
      value: pending,
    },
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString()}`,
    },
  ];

  return (
    <div className="summary-grid">

      {cards.map((card) => (

        <div
          className="summary-card"
          key={card.title}
        >

          <h4>{card.title}</h4>

          <h2>{card.value}</h2>

        </div>

      ))}

    </div>
  );
}

export default InvoiceSummary;