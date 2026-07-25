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
    // A4 at 96 dpi = 794px wide
    const A4_WIDTH_PX = 794;

    // Create an off-screen wrapper at exact A4 width so content is truly centered
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: ${A4_WIDTH_PX}px;
      background: #ffffff;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    `;

    // Clone the sheet and force it to fill the A4 width with equal margins
    const clone = sheet.cloneNode(true);
    clone.style.cssText = `
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 24px 32px;
      box-sizing: border-box;
      background: #ffffff;
      border: none;
      box-shadow: none;
      border-radius: 0;
    `;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: A4_WIDTH_PX,
      height: wrapper.scrollHeight,
      windowWidth: A4_WIDTH_PX,
      windowHeight: wrapper.scrollHeight,
      logging: false,
    });

    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth  = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight();  // 297 mm

    // canvas is 2× scale — convert back to logical px then to mm
    const canvasWidthMM  = (canvas.width  / 2) * 25.4 / 96;
    const canvasHeightMM = (canvas.height / 2) * 25.4 / 96;

    const scale = pageWidth / canvasWidthMM;
    const renderedHeight = canvasHeightMM * scale;

    // Place image starting at x=0 so it fills the full A4 width perfectly
    doc.addImage(imgData, "PNG", 0, 0, pageWidth, renderedHeight);

    // Add extra pages for very long invoices
    let remaining = renderedHeight;
    let offsetMM  = 0;
    while (remaining > pageHeight) {
      doc.addPage();
      offsetMM  -= pageHeight;
      remaining -= pageHeight;
      doc.addImage(imgData, "PNG", 0, offsetMM, pageWidth, renderedHeight);
    }

    const filename = `${invoice.id || "Invoice"}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("PDF generation failed. Please try using the Print button instead.");
  }
}

export default generateInvoicePDF;