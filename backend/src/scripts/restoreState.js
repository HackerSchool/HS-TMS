// Script for restoring the backend to a previous state from a backup file.
// Run this script from the host machine, not inside the Docker container.
// Navigate to the backend directory before executing the script.
//
// Usage: node src/scripts/restoreState.js <backup file basename>
// Example 1: node src/scripts/restoreState.js 2024-02.zip		(scheduled backup)
// Example 2: node src/scripts/restoreState.js 2024-01-12.zip	(unscheduled backup)

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Check if the script is being run from the backend directory
if (path.basename(process.cwd()) !== "backend") {
	console.error("Please run this script from the backend directory.");
	process.exit(1);
}

// Check if backup file basename was provided
const args = process.argv.slice(2);
if (args.length !== 1) {
	console.error("Please provide the backup file basename.");
	process.exit(1);
}

// Extract backup file basename
const backupBasename = args[0];
const backupDir = path.parse(backupBasename).name;

// Check if backup file basename is valid
if (backupBasename.length !== 11 && backupBasename.length !== 14) {
	console.error("Please provide a valid backup file basename.");
	process.exit(1);
}
const isUnscheduledBackup = backupBasename.length === 14;

// Unzip backup file
execSync(`unzip -o storage/backups/${backupBasename} -d ${backupDir}`, {
	stdio: "inherit"
});

// Replace storage files with backup ones
const folders = ["logs", "receipts", "reports"];
for (const folder of folders) {
	execSync(`rm -f storage/${folder}/*`, { stdio: "inherit" });

	if (isUnscheduledBackup) {
		if (fs.readdirSync(`${backupDir}/${folder}`).length > 1) {
			execSync(`mv -f ${backupDir}/${folder}/* storage/${folder}/`, {
				stdio: "inherit"
			});
		}
	} else {
		if (
			folder === "receipts" &&
			fs.readdirSync(`${backupDir}/${folder}`).length > 1
		) {
			execSync(`mv -f ${backupDir}/${folder}/* storage/${folder}/`, {
				stdio: "inherit"
			});
		}
	}
}
execSync(`mv -f ${backupDir}/backup.sql storage`, { stdio: "inherit" });
console.log("\nRestored storage files from backup.\n");

// Remove backup directory
execSync(`rm -rf ${backupDir}`, { stdio: "inherit" });

// Stop and remove Docker containers
execSync("docker compose down", { stdio: "inherit" });

// Start Docker containers
execSync("docker compose up -d", { stdio: "inherit" });

// Wait for Docker containers to start
console.log("\nWaiting for Docker containers to start...\n");
execSync("sleep 30", { stdio: "inherit" });

// Restore database
execSync(
	`docker exec backend sh -c 'PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} < ./storage/backup.sql'`,
	{ stdio: "inherit" }
);
console.log("Restored database from backup.");

// Remove backup file
execSync(`rm -f storage/backup.sql`, { stdio: "inherit" });

console.log("\nDone.");
