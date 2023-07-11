/**
 * @param {integer} id
 * @returns {string}
 */
function generateTransactionFilePath(id) {
	return __dirname + "/../uploads/transaction" + String(id).padStart(4, "0") + ".pdf";
}

module.exports = {
	generateTransactionFilePath
};
