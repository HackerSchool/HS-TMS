const { CronJob } = require("cron");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const { sendReminderEmail } = require("../modules/email");

new CronJob(
  "0 4 * * *", // Every day at 4 am
  async () => {
    try {
      const reminders = await Reminder.getAll(require("../models/pool"), true);
      const recipients = (await User.getAll(require("../models/pool")))
        .filter((user) => user.active)
        .map((user) => user.email);

      for (const reminder of reminders) {
        if (await sendReminderEmail(recipients, reminder)) {
          await Reminder.setNotified(require("../models/pool"), reminder.id, true);
        }
      }
    } catch (error) {}
  },
  null,
  true,
  "Europe/Lisbon",
);
