const Reminder = require("../models/Reminder");
const { isValidDate } = require("../utils/dateUtils");
const { emailLoggerFn } = require("../modules/logging");

async function createReminder(req, res) {
  const pool = req.pool;
  const { title, description, date } = req.body;

  // input validation
  if (
    title === undefined ||
    typeof title !== "string" ||
    title === "" ||
    !isValidDate(date) ||
    (description !== undefined && typeof description !== "string")
  )
    return res.status(400).send("Invalid params");

  const reminder = await Reminder.createOne(pool, title, description, date);
  res.status(201).send(reminder);

  emailLoggerFn(req.user.name, "Reminder", req.method, null, reminder);
}

async function getReminder(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id)))
    // assure id is an integer
    return res.status(400).send("Invalid params");

  const reminder = await Reminder.getOne(pool, parseInt(id));

  if (reminder === undefined) return res.status(404).send("Reminder not found");

  res.status(200).send(reminder);
}

async function updateReminder(req, res) {
  const pool = req.pool;
  const { id } = req.params;
  const { title, description, date } = req.body;

  // input validation
  if (
    title === undefined ||
    typeof title !== "string" ||
    title === "" ||
    !isValidDate(date) ||
    (description !== undefined && typeof description !== "string") ||
    !Number.isInteger(parseFloat(id))
  )
    return res.status(400).send("Invalid params");

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
  if (!Number.isInteger(parseFloat(id))) return res.status(400).send("Invalid params");

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
