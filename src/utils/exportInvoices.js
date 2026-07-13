export function exportInvoicesToCSV(invoices) {
  const headers = [
    "Invoice ID",
    "Customer",
    "Date",
    "Amount",
    "Status",
  ];

  const rows = invoices.map((invoice) => [
    invoice.id,
    invoice.customer,
    invoice.date,
    invoice.amount,
    invoice.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "Invoices.csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}