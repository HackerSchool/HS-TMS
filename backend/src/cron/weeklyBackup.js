const { CronJob } = require("cron");
const { weeklyBackup } = require("../modules/backup");

new CronJob(
  "0 4 * * 1", // Every Monday at 4 am
  async () => {
    try {
      await weeklyBackup();
    } catch (error) {}
  },
  null,
  true,
  "Europe/Lisbon",
);
