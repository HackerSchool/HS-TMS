// Script for unscheduled backup of the backend.
// Run this script from the Docker container.
// Navigate to the backend directory before executing the script.
//
// Usage: node src/scripts/unscheduledBackup.js

const path = require("path");
require("dotenv").config();

// Check if the script is being run from the backend directory
if (path.basename(process.cwd()) !== "backend") {
	console.error("Please run this script from the backend directory.");
	process.exit(1);
}

const { unscheduledBackup } = require("../modules/backup");

unscheduledBackup();
