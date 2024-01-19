const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const moment = require("moment-timezone");
const User = require("../../models/User");
const { sendWeeklySummaryEmail } = require("../email");
const {
	readLogFile,
	clearLogFile,
	zipFolder,
	deleteOldBackups,
	deleteReports
} = require("../../utils/fileUtils");

async function backupDatabase() {
	const bashCommand = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -a -f ../../../storage/backup.sql`;
	const options = {
		cwd: __dirname
	};

	const { stderr } = await exec(bashCommand, options);

	if (stderr) {
		throw new Error(stderr);
	}
}

async function weeklyBackup() {
	await sendWeeklySummaryEmail(
		(await User.getAll(require("../../models/pool")))
			.filter((user) => user.active)
			.map((user) => user.email),
		await readLogFile(__dirname + "/../../../storage/logs/email.log")
	);

	await backupDatabase();

	zipFolder(
		__dirname + "/../../../storage",
		__dirname + "/../../../storage/backups/" + moment().format("YYYY-WW") + ".zip"
	);

	clearLogFile(__dirname + "/../../../storage/logs/combined.log");
	clearLogFile(__dirname + "/../../../storage/logs/email.log");
	clearLogFile(__dirname + "/../../../storage/logs/error.log");
	deleteOldBackups();
	deleteReports();
	fs.unlinkSync(__dirname + "/../../../storage/backup.sql");
}

async function unscheduledBackup() {
	await backupDatabase();

	zipFolder(
		__dirname + "/../../../storage",
		__dirname + "/../../../storage/backups/" + moment().format("YYYY-MM-DD") + ".zip"
	);

	fs.unlinkSync(__dirname + "/../../../storage/backup.sql");
}

module.exports = {
	weeklyBackup,
	unscheduledBackup
};
