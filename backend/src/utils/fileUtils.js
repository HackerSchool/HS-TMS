const fs = require("fs");
const readline = require("readline");
const AdmZip = require("adm-zip");
const moment = require("moment-timezone");

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

  return __dirname + "/../../storage/reports/report" + timestamp.replace(/[:.]/g, "-") + ".pdf";
}

/**
 * @param {string} filePath
 * @returns {Array<object>}
 */
async function readLogFile(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF

  const logs = [];
  for await (const line of rl) {
    const logObject = JSON.parse(line);

    try {
      logObject.message = JSON.parse(logObject.message);
    } catch (error) {}

    logs.push(logObject);
  }

  return logs;
}

/**
 * @param {string} filePath
 */
async function clearLogFile(filePath) {
  fs.writeFileSync(filePath, "");
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

function deleteReports() {
  const reportFiles = fs.readdirSync(__dirname + "/../../storage/reports");

  reportFiles.forEach((file) => {
    if (file !== ".gitkeep") {
      fs.unlinkSync(__dirname + "/../../storage/reports/" + file);
    }
  });
}

function deleteOldBackups() {
  const currentWeekDate = moment().startOf("isoWeek");
  const backupFiles = fs.readdirSync(__dirname + "/../../storage/backups");

  backupFiles.forEach((file) => {
    if (file.length !== 11) return; // skip unscheduled backups

    const dotIndex = file.lastIndexOf(".");

    if (dotIndex !== -1) {
      const fileWeek = file.substring(0, dotIndex);
      const fileWeekDate = moment(fileWeek, "YYYY-WW");
      if (currentWeekDate.diff(fileWeekDate, "weeks") > 4) {
        fs.unlinkSync(__dirname + "/../../storage/backups/" + file);
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
  deleteReports,
  deleteOldBackups,
};
