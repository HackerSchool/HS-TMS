const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { CronJob } = require("cron");
const { logError } = require("../modules/logging");

new CronJob(
  "0 4 1 * *", // 4 am on the 1st day of every month
  async () => {
    try {
      const bashCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_DEMO_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -a -f ../../init-demo.sql`;
      const options = {
        cwd: __dirname,
      };

      const { stderr } = await exec(bashCommand, options);

      if (stderr) {
        throw new Error(stderr);
      }
    } catch (error) {
      logError(
        "cron/monthlyDummyData",
        `a problem occurred while running the monthlyDummyData job\n${error.stack}`,
      );
    }
  },
  null,
  true,
  "Europe/Lisbon",
);
