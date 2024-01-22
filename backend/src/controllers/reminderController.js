const Reminder = require("../models/Reminder");
const { isValidDate } = require("../utils/dateUtils");
const { emailLoggerFn, logInfo } = require("../modules/logging");

async function createReminder(req, res) {
  const pool = req.pool;
  const { title, description, date } = req.body;

  // input validation
  try {
    if (title === undefined || typeof title !== "string" || title === "") {
      throw new Error(`invalid title '${JSON.stringify(title)}' (${typeof title})`);
    }
    if (!isValidDate(date)) {
      throw new Error(`invalid date '${JSON.stringify(date)}' (${typeof date})`);
    }
    if (description !== undefined && typeof description !== "string") {
      throw new Error(
        `invalid description '${JSON.stringify(description)}' (${typeof description})`,
      );
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("reminderController/createReminder", error.message, "Validation");
    return;
  }

  const reminder = await Reminder.createOne(pool, title, description, date);
  res.status(201).send(reminder);

  emailLoggerFn(req.user.name, "Reminder", req.method, null, reminder);
}

async function getReminder(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("reminderController/getReminder", `invalid id '${id}'`, "Validation");
    return;
  }

  const reminder = await Reminder.getOne(pool, parseInt(id));

  if (reminder === undefined) return res.status(404).send("Reminder not found");

  res.status(200).send(reminder);
}

async function updateReminder(req, res) {
  const pool = req.pool;
  const { id } = req.params;
  const { title, description, date } = req.body;

  // input validation
  try {
    if (!Number.isInteger(parseFloat(id))) {
      throw new Error(`invalid id '${id}'`);
    }
    if (title === undefined || typeof title !== "string" || title === "") {
      throw new Error(`invalid title '${JSON.stringify(title)}' (${typeof title})`);
    }
    if (!isValidDate(date)) {
      throw new Error(`invalid date '${JSON.stringify(date)}' (${typeof date})`);
    }
    if (description !== undefined && typeof description !== "string") {
      throw new Error(
        `invalid description '${JSON.stringify(description)}' (${typeof description})`,
      );
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("reminderController/updateReminder", error.message, "Validation");
    return;
  }

  const oldReminder = await Reminder.getOne(pool, parseInt(id));
  const reminder = await Reminder.updateOne(pool, parseInt(id), title, description, date);

  if (reminder === undefined) return res.status(404).send("Reminder not found");

  res.status(200).send(reminder);

  emailLoggerFn(req.user.name, "Reminder", req.method, oldReminder, reminder);

  if (oldReminder.date !== reminder.date) {
    await Reminder.setNotified(pool, reminder.id, false);
  }
}

async function deleteReminder(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("reminderController/deleteReminder", `invalid id '${id}'`, "Validation");
    return;
  }

  const deletedReminder = await Reminder.deleteOne(pool, parseInt(id));

  if (deletedReminder === undefined) return res.status(404).send("Reminder not found");

  res.status(204).end();

  emailLoggerFn(req.user.name, "Reminder", req.method, deletedReminder, null);
}

async function getAllReminders(req, res) {
  const pool = req.pool;

  res.status(200).send(await Reminder.getAll(pool));
}

module.exports = {
  createReminder,
  getReminder,
  updateReminder,
  deleteReminder,
  getAllReminders,
};
