const fs = require("fs");
const readline = require("readline");
const AdmZip = require("adm-zip");

/**
 * @param {integer} id
 * @returns {string}
 */
function generateReceiptPath(id) {
	return (
		__dirname +
		"/../../storage/receipts/transaction" +
		String(id).padStart(4, "0") +
		".pdf"
	);
}

/**
 * @returns {string}
 */
function generateReportPath() {
	const timestamp = new Date().toISOString();

	return (
		__dirname +
		"/../../storage/reports/report" +
		timestamp.replace(/[:.]/g, "-") +
		".pdf"
	);
}

/**
 * @param {string} filePath
 * @returns {Array<object>}
 */
async function readLogFile(filePath) {
	const fileStream = fs.createReadStream(filePath);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});
	// Note: we use the crlfDelay option to recognize all instances of CR LF

	const logs = [];
	for await (const line of rl) {
		try {
			const logObject = JSON.parse(line);
			logs.push(logObject);
		} catch (error) {
			console.error("Error parsing log entry:", error);
		}
	}

	return logs;
}

/**
 * @param {string} sourceFolder
 * @param {string} outputZipFile
 */
function zipFolder(sourceFolder, outputZipFile) {
	const zip = new AdmZip();

	const dirEntries = fs.readdirSync(sourceFolder);
	dirEntries.forEach((entry) => {
		const path = sourceFolder + "/" + entry;

		if (entry !== "backups") {
			if (fs.statSync(path).isDirectory()) {
				zip.addLocalFolder(path, entry);
			} else {
				zip.addLocalFile(path);
			}
		}
	});

	zip.writeZip(outputZipFile);
}

module.exports = {
	generateReceiptPath,
	generateReportPath,
	readLogFile,
	zipFolder
};
