const fs = require("fs");
const Transaction = require("../models/Transaction");
const fileUtils = require("../utils/fileUtils");

async function createTransaction(req, res) {
	const pool = req.pool;
	const { date, description, value, hasNif, projects } = req.body;

	if (req.files && Object.keys(req.files).length !== 0) {
		const transaction = await Transaction.createOne(
			pool,
			date,
			description,
			value,
			true,
			hasNif,
			projects
		);
		const uploadedFile = req.files.receipt;

		uploadedFile.mv(fileUtils.generateReceiptPath(transaction.id), function (err) {
			if (err) {
				res.status(500).send("File upload failed");
			} else res.status(201).send(transaction);
		});
	} else {
		res.status(201).send(
			await Transaction.createOne(
				pool,
				date,
				description,
				value,
				false,
				hasNif,
				projects
			)
		);
	}
}

async function getTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	res.status(200).send(await Transaction.getOne(pool, id));
}

async function downloadReceipt(req, res) {
	const { id } = req.params;

	res.download(fileUtils.generateReceiptPath(id), function (err) {
		if (err) {
			res.status(404).end();
		}
	});
}

async function updateTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { date, description, value, hasFile, hasNif, projects } = req.body;

	res.status(200).send(
		await Transaction.updateOne(
			pool,
			id,
			date,
			description,
			value,
			hasFile,
			hasNif,
			projects
		)
	);
}

async function deleteTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	await Transaction.deleteOne(pool, id);

	fs.unlink(fileUtils.generateReceiptPath(id), (err) => {});

	res.status(204).end();
}

async function getAllTransactions(req, res) {
	const pool = req.pool;

	const {
		initialDate,
		finalDate,
		initialMonth,
		finalMonth,
		initialValue,
		finalValue,
		hasNif,
		hasFile,
		projects,
		balanceBy,
		orderBy,
		order,
		limit
	} = req.query;

	res.status(200).send(
		await Transaction.getAll(
			pool,
			initialDate,
			finalDate,
			initialMonth,
			finalMonth,
			initialValue && parseFloat(initialValue),
			finalValue && parseFloat(finalValue),
			hasNif && JSON.parse(hasNif),
			hasFile && JSON.parse(hasFile),
			projects && JSON.parse(projects),
			balanceBy,
			orderBy,
			order,
			limit
		)
	);
}

async function generateReport(req, res) {
	const pool = req.pool;

	const {
		initialDate,
		finalDate,
		initialMonth,
		finalMonth,
		initialValue,
		finalValue,
		hasNif,
		hasFile,
		projects,
		balanceBy,
		orderBy,
		order,
		limit
	} = req.query;

	const transactions = await Transaction.getAll(
		pool,
		initialDate,
		finalDate,
		initialMonth,
		finalMonth,
		initialValue && parseFloat(initialValue),
		finalValue && parseFloat(finalValue),
		hasNif && JSON.parse(hasNif),
		hasFile && JSON.parse(hasFile),
		projects && JSON.parse(projects),
		balanceBy,
		orderBy,
		order,
		limit
	);

	// Generating an empty report
	// Replace with a function that generates the actual report
	const reportPath = fileUtils.generateReportPath();

	fs.writeFile(reportPath, "", (err) => {
		if (err) {
			return res.status(500).send("Report generation failed");
		}
	});

	res.download(reportPath, function (err) {
		if (err) {
			res.status(500).send("Report download failed");
		}
	});
}

module.exports = {
	createTransaction,
	getTransaction,
	downloadReceipt,
	updateTransaction,
	deleteTransaction,
	getAllTransactions,
	generateReport
};
