/**
 * @param {integer} id
 * @returns {string}
 */
function generateReceiptPath(id) {
	return __dirname + "/../receipts/transaction" + String(id).padStart(4, "0") + ".pdf";
}

/**
 * @returns {string}
 */
function generateReportPath() {
	const timestamp = new Date().toISOString();

	return __dirname + "/../reports/report" + timestamp.replace(/[:.]/g, "-") + ".pdf";
}

module.exports = {
	generateReceiptPath,
	generateReportPath
};
