const fs = require("fs");
const readline = require("readline");
const AdmZip = require("adm-zip");
const moment = require("moment");
const { sendWeeklySummaryEmail } = require("../modules/email");
const User = require("../models/User");

/**
 * @param {integer} id
 * @param {boolean} isDemo
 * @returns {string}
 */
function generateReceiptPath(id, isDemo = false) {
	return (
		__dirname +
		"/../../storage/receipts/" +
		(isDemo ? "demo-" : "") +
		"transaction" +
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

			try {
				logObject.message = JSON.parse(logObject.message);
			} catch (error) {}

			logs.push(logObject);
		} catch (error) {
			console.error("Error parsing log entry:", error);
		}
	}

	return logs;
}

/**
 * @param {string} filePath
 */
async function clearLogFile(filePath) {
	try {
		fs.writeFileSync(filePath, "");
	} catch (error) {}
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

async function weeklyBackup() {
	await sendWeeklySummaryEmail(
		(await User.getAll(require("../models/pool")))
			.filter((user) => user.active)
			.map((user) => user.email),
		await readLogFile(__dirname + "/../../storage/logs/email.log")
	);

	zipFolder(
		__dirname + "/../../storage",
		__dirname + "/../../storage/backups/" + moment().format("YYYY-WW") + ".zip"
	);

	clearLogFile(__dirname + "/../../storage/logs/combined.log");
	clearLogFile(__dirname + "/../../storage/logs/email.log");
	clearLogFile(__dirname + "/../../storage/logs/error.log");
	deleteOldBackups();
}

function deleteOldBackups() {
	const currentWeek = moment().isoWeek();
	const backupFiles = fs.readdirSync(__dirname + "/../../storage/backups");

	backupFiles.forEach((file) => {
		const dotIndex = file.lastIndexOf(".");

		if (dotIndex !== -1) {
			const fileParts = file.substring(0, dotIndex).split("-");
			if (fileParts.length === 2) {
				const fileWeek = parseInt(fileParts[1], 10);

				if (
					(currentWeek >= fileWeek && currentWeek - fileWeek > 4) ||
					(currentWeek < fileWeek && currentWeek + 52 - fileWeek > 4)
				) {
					fs.unlink(
						__dirname + "/../../storage/backups" + "/" + file,
						(err) => {}
					);
				}
			}
		}
	});
}

module.exports = {
	generateReceiptPath,
	generateReportPath,
	readLogFile,
	clearLogFile,
	zipFolder,
	weeklyBackup,
	deleteOldBackups
};
