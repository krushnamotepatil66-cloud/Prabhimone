import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function generateInvoicePDF(invoice) {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("Invoice", 14, 20);

  doc.setFontSize(12);

  doc.text(`Invoice ID : ${invoice.id}`, 14, 35);
  doc.text(`Customer : ${invoice.customer}`, 14, 43);
  doc.text(`Date : ${invoice.date}`, 14, 51);
  doc.text(`Status : ${invoice.status}`, 14, 59);

  autoTable(doc, {
    startY: 70,
    head: [["Description", "Qty", "Price", "Total"]],
    body: [
      [
        "Invoice Amount",
        "1",
        invoice.amount,
        invoice.amount,
      ],
    ],
  });

  doc.setFontSize(14);

  doc.text(
    `Grand Total : ${invoice.amount}`,
    14,
    doc.lastAutoTable.finalY + 15
  );

  doc.save(`${invoice.id}.pdf`);
}

export default generateInvoicePDF;