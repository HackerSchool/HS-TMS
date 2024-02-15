const fs = require("fs");
const path = require("path");
const { CronJob } = require("cron");
const { logError } = require("../modules/logging");

new CronJob(
  "0 5 * * *", // Every day at 5 am
  async () => {
    try {
      const folderPath = __dirname + "/../../storage/backups";
      const destinationPath = "/var/lib/hs-tms/storage";

      const dirEntries = fs.readdirSync(folderPath);
      dirEntries.forEach((file) => {
        if (file === ".gitkeep") {
          return;
        }

        const filePath = path.join(folderPath, file);
        const destinationFilePath = path.join(destinationPath, file);
        if (!fs.existsSync(destinationFilePath)) {
          fs.copyFileSync(filePath, destinationFilePath);
        }
      });
    } catch (error) {
      logError(
        "cron/dailyStorageBackup",
        `a problem occurred while running the dailyStorageBackup job\n${error.stack}`,
      );
    }
  },
  null,
  true,
  "Europe/Lisbon",
);
