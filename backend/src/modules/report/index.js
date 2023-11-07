const pdfMake = require("pdfmake/build/pdfmake");
const vfs = require("pdfmake/build/vfs");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const attachPDFs = require("./attachPDFs");
const { getDocDef, tableLayouts } = require("./docDef");
const { generateReportPath } = require("../../utils/fileUtils");

/**
 * High order function that creates the report
 * @async
 * @param {Array<Transaction>} transactions 
 * @param {Object} filters 
 * @param {Array<Object>} pdfsToAttach { path, title } pairs
 * @returns 
 */
async function report(
    transactions,
    filters = {},
    pdfsToAttach = []
) {
    pdfMake.vfs = vfs.pdfMake.vfs;
    const stdFonts = {
        Times: {
            normal: "Times-New-Roman.ttf",
            bold: "Times-New-Roman-Bold.ttf",
            italics: "Times-New-Roman-Italic.ttf",
            bolditalics: "Times-New-Roman-Bold-Italic.ttf",
        },
    };

    const reportPdfmakeDoc = pdfMake.createPdf(
        getDocDef(filters, transactions),
        tableLayouts,
        stdFonts
    );

    const reportBuffer = await (async () => {
        let resolveCb;
        const bufferPromise = new Promise((resolve) => {
            resolveCb = resolve;
        });

        reportPdfmakeDoc.getBuffer(async (res) => {
            resolveCb(res);
        });

        return bufferPromise;
    })();

    const destinationPath = generateReportPath();

    if (pdfsToAttach.length === 0) {
        fs.writeFileSync(destinationPath, reportBuffer);
        return destinationPath;
    }

    const reportPdf_lib = await PDFDocument.load(reportBuffer);
    const mergedPdfBuffer = await attachPDFs(reportPdf_lib, pdfsToAttach);

    // Save the merged PDF to a file
    fs.writeFileSync(destinationPath, mergedPdfBuffer);

    return destinationPath;
}

module.exports = report;
