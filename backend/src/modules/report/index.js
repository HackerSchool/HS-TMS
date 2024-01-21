const pdfMake = require("pdfmake/build/pdfmake");
const vfs = require("pdfmake/build/vfs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const generateReceiptsPDF = require("./generateReceiptsPDF");
const { getDocDef, tableLayouts } = require("./docDef");
const { generateReportPath } = require("../../utils/fileUtils");

/**
 * High order function that creates the report
 * @async
 * @param {Array<Transaction>} transactions
 * @param {boolean} includeReceipts
 * @param {object} filters
 * @param {boolean} fakeCredentials
 * @returns the path to the generated report
 */
async function report(transactions, includeReceipts, filters = {}, fakeCredentials = false) {
  pdfMake.vfs = vfs.pdfMake.vfs;
  const stdFonts = {
    Times: {
      normal: "Times-New-Roman.ttf",
      bold: "Times-New-Roman-Bold.ttf",
      italics: "Times-New-Roman-Italic.ttf",
      bolditalics: "Times-New-Roman-Bold-Italic.ttf",
    },
  };

  const destinationPath = generateReportPath();

  const IDsOfTransactionsWithFile = transactions.filter((t) => t.has_file).map((t) => t.id);

  if (!includeReceipts || IDsOfTransactionsWithFile.length === 0) {
    const reportPdfmakeDoc = pdfMake.createPdf(
      getDocDef(filters, transactions, fakeCredentials, true),
      tableLayouts,
      stdFonts,
    );

    const reportBuffer = await getPdfmakeBuffer(reportPdfmakeDoc);

    fs.writeFileSync(destinationPath, reportBuffer);
    return destinationPath;
  }

  const { receiptsPdf, pageMap, receiptPdfProps } = await generateReceiptsPDF(
    IDsOfTransactionsWithFile,
    fakeCredentials, // fakeCredentials = (req.user.username === "demo")
  );

  // To create a link in the report from the transactions to the pages that
  // contain their receipt, we need to generate a dummy report that's exactly
  // the same as the final one, except that it doesn't have this links, so
  // we know how many pages it will occupy and with that information,
  // the page reference in the final document, since the report comes first.
  // We use an object so it gets passed by reference
  const pageCount = { value: 0 };
  const storePageNumber = (value) => (pageCount.value = value);

  let reportPdfmakeDoc = pdfMake.createPdf(
    getDocDef(filters, transactions, fakeCredentials, undefined, storePageNumber),
    tableLayouts,
    stdFonts,
  );

  // Trigger the pdf creation to get the page count of the receipt
  await getPdfmakeBuffer(reportPdfmakeDoc);

  // Increment all the pages by the page count of the report
  pageMap.forEach((pageList, key, map) => {
    map.set(
      key,
      pageList.map((pageNum) => pageNum + pageCount.value),
    );
  });

  // Create the final report with links to each receipt page numbers
  reportPdfmakeDoc = pdfMake.createPdf(
    getDocDef(filters, transactions, fakeCredentials, undefined, undefined, pageMap),
    tableLayouts,
    stdFonts,
  );

  const reportBuffer = await getPdfmakeBuffer(reportPdfmakeDoc);

  // Load the report with pdf-lib to make the final merge with the receipts
  const reportPdf_lib = await PDFDocument.load(reportBuffer);
  const receiptPages = await reportPdf_lib.copyPages(receiptsPdf, receiptsPdf.getPageIndices());
  for (const newPage of receiptPages) reportPdf_lib.addPage(newPage);

  // Add pagination through pdf-lib
  const { paddingX, paddingY, receiptPageCount } = receiptPdfProps;
  const fontSize = 12;
  const font = await reportPdf_lib.embedFont(StandardFonts.TimesRoman);

  const totalPageCount = receiptPageCount + pageCount.value;

  for (let i = 0; i < totalPageCount; i++) {
    const page = reportPdf_lib.getPage(i);
    const text = `${i + 1} / ${totalPageCount}`;
    page.drawText(text, {
      x: page.getWidth() - paddingX / 2 - font.widthOfTextAtSize(text, fontSize),
      y: paddingY / 2,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });
  }

  const mergedPdfBuffer = await reportPdf_lib.save();

  // Save the merged PDF to a file
  fs.writeFileSync(destinationPath, mergedPdfBuffer);

  return destinationPath;
}

async function getPdfmakeBuffer(pdfmakeDoc) {
  let resolveCb;
  const bufferPromise = new Promise((resolve) => {
    resolveCb = resolve;
  });

  pdfmakeDoc.getBuffer(async (res) => {
    resolveCb(res);
  });

  return bufferPromise;
}

module.exports = report;
