const Transaction = require("../models/Transaction");

async function createTransaction(req, res) {
	const pool = req.pool;
	const { date, description, value, filePath, hasNif, projects } = req.body;

	res.status(201).send(
		await Transaction.createOne(
			pool,
			date,
			description,
			value,
			filePath,
			hasNif,
			projects
		)
	);
}

async function getTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	res.status(200).send(await Transaction.getOne(pool, id));
}

async function updateTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { date, description, value, filePath, hasNif, projects } = req.body;

	res.status(200).send(
		await Transaction.updateOne(
			pool,
			id,
			date,
			description,
			value,
			filePath,
			hasNif,
			projects
		)
	);
}

async function deleteTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	await Transaction.deleteOne(pool, id);

	res.status(204).end();
}

async function getAllTransactions(req, res) {
	const pool = req.pool;

	const {
		initialMonth,
		finalMonth,
		initialValue,
		finalValue,
		hasNif,
		projects,
		orderBy,
		order
	} = req.query;

	res.status(200).send(
		await Transaction.getAll(
			pool,
			initialMonth,
			finalMonth,
			initialValue && parseFloat(initialValue),
			finalValue && parseFloat(finalValue),
			hasNif && JSON.parse(hasNif),
			projects && JSON.parse(projects),
			orderBy,
			order
		)
	);
}

module.exports = {
	createTransaction,
	getTransaction,
	updateTransaction,
	deleteTransaction,
	getAllTransactions
};
