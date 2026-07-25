import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures the .invoice-paper-sheet element from the DOM and saves it
 * as a full A4 PDF — identical to how it looks on screen / when printed.
 */
async function generateInvoicePDF(invoice, settings = {}) {
  const sheet = document.querySelector(".invoice-paper-sheet");
  if (!sheet) {
    alert("Invoice preview not found. Please open the invoice preview first.");
    return;
  }

  try {
    // A4 dimensions in points (1 pt = 1/72 inch)
    // 210mm × 297mm  →  595.28pt × 841.89pt
    const A4_WIDTH_PX  = 794;  // 210mm at 96 dpi ≈ 794px
    const A4_HEIGHT_PX = 1123; // 297mm at 96 dpi ≈ 1123px

    const canvas = await html2canvas(sheet, {
      scale: 2,               // 2× for crisp text on retina
      useCORS: true,
      backgroundColor: "#ffffff",
      width: sheet.scrollWidth,
      height: sheet.scrollHeight,
      windowWidth: sheet.scrollWidth,
      windowHeight: sheet.scrollHeight,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth  = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight();  // 297 mm

    // Scale canvas to fit the full A4 width
    const canvasWidthMM  = (canvas.width  / 2) * 25.4 / 96; // canvas is 2×, convert px → mm
    const canvasHeightMM = (canvas.height / 2) * 25.4 / 96;

    const scale = pageWidth / canvasWidthMM;
    const renderedHeight = canvasHeightMM * scale;

    // If content is taller than one A4 page, tile across multiple pages
    let positionMM = 0;
    let remaining  = renderedHeight;

    doc.addImage(imgData, "PNG", 0, positionMM, pageWidth, renderedHeight);

    // Add extra pages for very long invoices
    while (remaining > pageHeight) {
      doc.addPage();
      positionMM -= pageHeight;
      remaining  -= pageHeight;
      doc.addImage(imgData, "PNG", 0, positionMM, pageWidth, renderedHeight);
    }

    const filename = `${invoice.id || "Invoice"}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("PDF generation failed. Please try using the Print button instead.");
  }
}

export default generateInvoicePDF;