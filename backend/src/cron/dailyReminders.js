const { CronJob } = require("cron");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const { sendReminderEmail } = require("../modules/email");
const { logError } = require("../modules/logging");

new CronJob(
  "0 4 * * *", // Every day at 4 am
  async () => {
    try {
      const reminders = await Reminder.getAll(require("../models/pool"), true);
      const recipients = (await User.getAll(require("../models/pool")))
        .filter((user) => user.active)
        .map((user) => user.email);

      for (const reminder of reminders) {
        await sendReminderEmail(recipients, reminder);
        await Reminder.setNotified(require("../models/pool"), reminder.id, true);
      }
    } catch (error) {
      logError(
        "cron/dailyReminders",
        `a problem occurred while running the dailyReminders job (${error})`,
      );
    }
  },
  null,
  true,
  "Europe/Lisbon",
);
