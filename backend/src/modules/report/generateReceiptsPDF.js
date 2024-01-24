const fs = require("fs");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const { generateReceiptPath } = require("../../utils/fileUtils");

/**
 * Given a list of transaction IDs, returns the resulting PDFDocument of
 * attaching all the receipts
 * @param {Array<integer>} transactionsIDs
 * @param {boolean} isDemo
 * @returns PDFDocument containing all receipts or null in case there are none
 * @returns Map<integer, integer[]> (id => pageNumber[])
 */
async function generateReceiptsPDF(transactionsIDs, isDemo) {
  const A4PageDim = { width: 595, height: 842 };
  const paddingY = 40;
  const paddingX = 40;

  // Create a new PDF document that will contain all the attachments
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Map that associates a transaction ID with its receipt pages
  const pageMap = new Map();
  let pageCount = 0;

  for (const id of transactionsIDs) {
    const pathToReceipt = generateReceiptPath(id, isDemo);

    // Load the existing PDF file from disk
    const existingPdfBuffer = fs.readFileSync(pathToReceipt);
    const receipt = await PDFDocument.load(existingPdfBuffer);

    const title = `Transaction ${id}'s receipt`;

    pageMap.set(id, []);

    // Append all the pages of the receipt to the original PDF
    for (const pageIdx of receipt.getPageIndices()) {
      // Add a blank page
      const page = pdfDoc.addPage([A4PageDim.width, A4PageDim.height]);

      // Save the receipt pages with the associated transaction ID
      pageMap.set(id, [...pageMap.get(id), ++pageCount]);

      // Add a title to the upper section of the page
      const fontSize = 20;
      const titleX = (page.getWidth() - font.widthOfTextAtSize(title, fontSize)) / 2;
      const titleY = A4PageDim.height - 50;

      page.drawText(title, {
        x: titleX,
        y: titleY,
        size: fontSize,
        color: rgb(0, 0, 0),
        font: font,
      });

      // Copy the "pageIdx" page of the receipt into the new PDF
      const [attachmentPage] = await pdfDoc.embedPdf(receipt, [pageIdx]);

      const availableHeight = titleY - paddingY * 2;
      const availableWidth = page.getWidth() - paddingX * 2;
      const attachmentRatio = attachmentPage.height / attachmentPage.width;
      let attachmentWidth = attachmentPage.width;
      let attachmentHeight = attachmentPage.height;

      let vertical = true;
      if (attachmentWidth > attachmentHeight) vertical = false;

      if (vertical) {
        if (availableHeight < attachmentHeight) {
          attachmentHeight = availableHeight;
          attachmentWidth = availableHeight / attachmentRatio;
        }

        if (availableWidth < attachmentWidth) {
          attachmentWidth = availableWidth;
          attachmentHeight = attachmentRatio * availableWidth;
        }
      } else {
        // if the page is horizontal (larger in width) it will be rotated
        // for better visibility
        if (availableWidth < attachmentHeight) {
          attachmentHeight = availableWidth;
          attachmentWidth = availableWidth / attachmentRatio;
        }

        if (availableHeight < attachmentWidth) {
          attachmentWidth = availableHeight;
          attachmentHeight = attachmentRatio * availableHeight;
        }
      }

      page.drawPage(attachmentPage, {
        x: (page.getWidth() - (vertical ? attachmentWidth : attachmentHeight)) / 2,
        y: vertical ? paddingY + availableHeight - attachmentHeight : paddingY + availableHeight,
        width: attachmentWidth,
        height: attachmentHeight,
        rotate: vertical ? degrees(0) : degrees(-90),
      });
    }
  }

  return {
    receiptsPdf: pageCount > 0 ? pdfDoc : null,
    pageMap,
    receiptPdfProps: {
      receiptPageCount: pageCount,
      paddingX,
      paddingY,
    },
  };
}

module.exports = generateReceiptsPDF;
