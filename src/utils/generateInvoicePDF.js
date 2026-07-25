import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { numberToWords } from "./numberToWords";

function generateInvoicePDF(invoice, settings = {}) {
  const doc = new jsPDF();
  const parseAmount = (amtStr) => Number(String(amtStr).replace(/[^0-9.-]/g, "")) || 0;

  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [{ product: "Invoice Amount", qty: 1, price: parseAmount(invoice.amount) }];

  const calculateItemDiscount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const discVal = Number(item.discount) || 0;
    if (item.discountType === "%" || item.discountType === "Percentage") {
      return (itemSub * discVal) / 100;
    }
    return discVal;
  };

  const calculateItemTaxableAmount = (item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const itemSub = qty * price;
    const disc = calculateItemDiscount(item);
    return Math.max(0, itemSub - disc);
  };

  const calculateItemTaxAmount = (item) => {
    const taxable = calculateItemTaxableAmount(item);
    const taxRate = Number(item.tax) || 0;
    return (taxable * taxRate) / 100;
  };

  let subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  let totalItemDiscount = items.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  let totalTaxableAmount = items.reduce((sum, item) => sum + calculateItemTaxableAmount(item), 0);
  let totalTax = items.reduce((sum, item) => sum + calculateItemTaxAmount(item), 0);

  const charges = Number(invoice.additionalCharges) || 0;
  const tempGrandTotal = totalTaxableAmount + totalTax + charges;
  const roundedGrandTotal = Math.round(tempGrandTotal);
  let roundOffDifference = invoice.autoRoundOff ? Number((roundedGrandTotal - tempGrandTotal).toFixed(2)) : 0;
  let totalAmount = invoice.autoRoundOff ? roundedGrandTotal : tempGrandTotal;

  const totalAmountInWords = numberToWords(Math.round(totalAmount));
  const currency = settings.currency || "Rs.";

  // Header Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Tax Invoice", 105, 15, { align: "center" });

  // Organization Info (Left)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "Prabhim Technologies (OPC) Pvt. Ltd.", 14, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(settings.address || "FL-1002 A, Utsav Residency Phase 1, Awhalwadi Road,", 14, 30);
  doc.text(settings.city || "Wagholi, Pune, 412202, India", 14, 35);
  doc.text(`Phone: ${settings.phone || "+91-9403301412"}`, 14, 40);
  doc.text(`e-mail: ${settings.email || "info@prabhimtechnologies.in"}`, 14, 45);
  doc.text(`GSTN: ${settings.gstin || "27AAPCP6019G1Z5"} | State: ${settings.state || "Maharashtra"}`, 14, 50);

  // Line Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 54, 196, 54);

  // Bill To (Left) & Invoice Meta (Right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 61);
  doc.text(invoice.customer || "Customer", 14, 67);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (invoice.billingAddress) {
    doc.text(invoice.billingAddress, 14, 72);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Invoice Details:", 130, 61);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice No.: ${invoice.id || "-"}`, 130, 67);
  doc.text(`Date: ${invoice.date || "-"}`, 130, 72);
  if (invoice.dueDate) {
    doc.text(`Due Date: ${invoice.dueDate}`, 130, 77);
  }

  // Items Table
  const tableData = items.map((item, idx) => [
    idx + 1,
    item.product || "Standard Item",
    item.hsn || "-",
    item.qty || "0",
    item.unit || "-",
    `${currency} ${Number(item.price || 0).toFixed(2)}`,
    item.discount ? `${item.discount}${item.discountType === "%" ? "%" : ""}` : "-",
    item.tax ? `${item.tax}%` : "-",
    `${currency} ${calculateItemTaxableAmount(item).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["#", "Item Details", "HSN/SAC", "Qty", "Unit", "Rate", "Disc.", "GST %", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 20 },
      3: { cellWidth: 12, halign: "right" },
      4: { cellWidth: 15, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 15, halign: "right" },
      8: { cellWidth: 22, halign: "right" },
    }
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // Amount in Words (Left) & Total Breakdown (Right)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Amount In Words:", 14, finalY);
  doc.setFont("helvetica", "normal");
  doc.text(totalAmountInWords, 14, finalY + 6, { maxWidth: 90 });

  let summaryY = finalY;
  const alignRightX = 196;

  doc.text(`Sub Total:  ${currency} ${subtotal.toFixed(2)}`, alignRightX, summaryY, { align: "right" });
  if (totalItemDiscount > 0) {
    summaryY += 5;
    doc.text(`Discount: -${currency} ${totalItemDiscount.toFixed(2)}`, alignRightX, summaryY, { align: "right" });
  }
  summaryY += 5;
  doc.text(`Taxable Amount:  ${currency} ${totalTaxableAmount.toFixed(2)}`, alignRightX, summaryY, { align: "right" });

  if (totalTax > 0) {
    summaryY += 5;
    doc.text(`CGST (9%):  ${currency} ${(totalTax / 2).toFixed(2)}`, alignRightX, summaryY, { align: "right" });
    summaryY += 5;
    doc.text(`SGST (9%):  ${currency} ${(totalTax / 2).toFixed(2)}`, alignRightX, summaryY, { align: "right" });
  }

  if (charges > 0) {
    summaryY += 5;
    doc.text(`Additional Charges:  ${currency} ${charges.toFixed(2)}`, alignRightX, summaryY, { align: "right" });
  }

  if (roundOffDifference !== 0) {
    summaryY += 5;
    doc.text(`Round Off:  ${roundOffDifference > 0 ? "+" : ""}${roundOffDifference}`, alignRightX, summaryY, { align: "right" });
  }

  summaryY += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount:  ${currency} ${totalAmount.toFixed(2)}`, alignRightX, summaryY, { align: "right" });

  // Footer / Signatory
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thanks for doing business with us!", 14, pageHeight - 20);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signatory", alignRightX, pageHeight - 20, { align: "right" });

  doc.save(`${invoice.id || "Invoice"}.pdf`);
}

export default generateInvoicePDF;