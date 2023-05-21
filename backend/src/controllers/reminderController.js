const Reminder = require("../models/Reminder");

async function createReminder(req, res) {
	const pool = req.pool;
	const { title, description, date } = req.body;

	res.status(201).send(await Reminder.createOne(pool, title, description, date));
}

async function getReminder(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	res.status(200).send(await Reminder.getOne(pool, id));
}

async function updateReminder(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { title, description, date } = req.body;

	res.status(200).send(await Reminder.updateOne(pool, id, title, description, date));
}

async function deleteReminder(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	await Reminder.deleteOne(pool, id);

	res.status(204).end();
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
	getAllReminders
};
