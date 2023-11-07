const fs = require("fs");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");

/**
 * Given a PDFDocument and a list of path-title pairs (pdfsToAttach), returns
 * the resulting PDFDocument bytes of attaching all the given PDFs to the
 * original PDFDocument
 * @param {PDFDocument} originalPdf 
 * @param {Array<Object>} pdfsToAttach 
 * @returns Promise containing resulting PDF bytes
 */
async function attachPDFs(originalPdf, pdfsToAttach) {
    try {
        const A4PageDim = { width: 595, height: 842 };

        // Create a new PDF document that will contain all the attachments
        const pdfDoc = await PDFDocument.create();

        for (const pdf of pdfsToAttach) {
            // Load the existing PDF file from disk
            const existingPdfBuffer = fs.readFileSync(pdf.path);
            const receipt = await PDFDocument.load(existingPdfBuffer);

            // Append all the pages of the receipt to the original PDF
            for (const pageIdx of receipt.getPageIndices()) {
                // Add a blank page
                const page = pdfDoc.addPage([
                    A4PageDim.width,
                    A4PageDim.height,
                ]);

                // Add a title to the upper section of the page
                const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                const fontSize = 20;
                const titleX =
                    (page.getWidth() -
                        font.widthOfTextAtSize(pdf.title, fontSize)) /
                    2;
                const titleY = A4PageDim.height - 50;

                page.drawText(pdf.title, {
                    x: titleX,
                    y: titleY,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                    font: font,
                });

                const [attachmentPage] = await pdfDoc.embedPdf(receipt, [
                    pageIdx,
                ]);

                const paddingY = 40;
                const paddingX = 40;
                const availableHeight = titleY - paddingY * 2;
                const availableWidth = page.getWidth() - paddingX * 2;
                const attachmentRatio =
                    attachmentPage.height / attachmentPage.width;
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
                    // x: (page.getWidth() - attachmentWidth) / 2,
                    // y: paddingY + availableHeight - attachmentHeight,
                    x:
                        (page.getWidth() -
                            (vertical ? attachmentWidth : attachmentHeight)) /
                        2,
                    y: vertical
                        ? paddingY + availableHeight - attachmentHeight
                        : paddingY + availableHeight,
                    width: attachmentWidth,
                    height: attachmentHeight,
                    rotate: vertical ? degrees(0) : degrees(-90),
                });
            }
        }

        const copiedPages = await originalPdf.copyPages(
            pdfDoc,
            pdfDoc.getPageIndices()
        );
        for (const newPage of copiedPages) originalPdf.addPage(newPage);

        return await originalPdf.save();
    } catch (error) {
        console.error("Error attaching PDFs:", error);
    }
}

module.exports = attachPDFs;