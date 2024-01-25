const { CronJob } = require("cron");
const { weeklyBackup } = require("../modules/backup");
const { logError } = require("../modules/logging");

new CronJob(
  "0 4 * * 1", // Every Monday at 4 am
  async () => {
    try {
      await weeklyBackup();
    } catch (error) {
      logError(
        "cron/weeklyBackup",
        `a problem occurred while running the weeklyBackup job\n${error.stack}`,
      );
    }
  },
  null,
  true,
  "Europe/Lisbon",
);
