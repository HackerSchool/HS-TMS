const fs = require("fs");
const Transaction = require("../models/Transaction");
const fileUtils = require("../utils/fileUtils");

async function createTransaction(req, res) {
	const pool = req.pool;
	const { date, description, value, hasNif, projects } = req.body;

    let invalid = false;

    if (date === undefined || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/g))
        invalid = true;

    if (value === undefined || typeof value !== 'number') invalid = true;

    if (hasNif === undefined || typeof hasNif !== 'boolean') invalid = true;

    if (description !== undefined && typeof description !== 'string') invalid = true;

    if (projects !== undefined && (
        !Array.isArray(projects) || !projects.every(v => parseFloat(v) % 1 === 0)
    )) invalid = true;

    if (invalid)
        return res.status(400).send("Invalid params");


	if (req.files && Object.keys(req.files).length !== 0) {
        const uploadedFile = req.files.receipt;

        // Assure receipt file type is pdf
        if (uploadedFile.mimetype !== "application/pdf")
            return res.status(400).send("Invalid params")

		const transaction = await Transaction.createOne(
			pool,
			date,
			description,
			value,
			true,
			hasNif,
			projects
		);

		uploadedFile.mv(
			fileUtils.generateTransactionFilePath(transaction.id),
			async function (err) {
				if (err) {
					await Transaction.deleteOne(pool, transaction.id);
					res.status(500).send("File upload failed");
				} else res.status(201).send(transaction);
			}
		);
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

    if (parseFloat(id) % 1 !== 0)
        return res.status(400).send("Invalid params");

    const transaction = await Transaction.getOne(pool, parseInt(id));

    if (transaction === undefined)
        return res.status(404).send("Transaction not found");

	res.status(200).send(transaction);
}

async function downloadTransaction(req, res) {
	const { id } = req.params;

    if (parseFloat(id) % 1 !== 0)
        return res.status(400).send("Invalid params");

	res.download(fileUtils.generateTransactionFilePath(parseInt(id)), function (err) {
		if (err) {
			res.status(404).end();
		}
	});
}

async function updateTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { date, description, value, hasFile, hasNif, projects } = req.body;

    let invalid = false;

    if (date === undefined || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/g))
        invalid = true;

    if (value === undefined || typeof value !== 'number') invalid = true;

    if (hasNif === undefined || typeof hasNif !== 'boolean') invalid = true;

    if (hasFile === undefined || typeof hasFile !== 'boolean') invalid = true;

    if (description !== undefined && typeof description !== 'string') invalid = true;

    if (projects !== undefined && (
        !Array.isArray(projects) || !projects.every(v => parseFloat(v) % 1 === 0)
    )) invalid = true;

    if (parseFloat(id) % 1 !== 0) invalid = true;

    if (invalid)
        return res.status(400).send("Invalid params");

    const transaction = await Transaction.updateOne(
        pool,
        parseInt(id),
        date,
        description,
        value,
        hasFile,
        hasNif,
        projects
    );

    if (transaction === undefined)
        return res.status(404).send("Transaction not found");

	res.status(200).send(transaction);
}

async function deleteTransaction(req, res) {
	const pool = req.pool;
	const { id } = req.params;

    if (parseFloat(id) % 1 !== 0)
        return res.status(400).send("Invalid params");

	await Transaction.deleteOne(pool, parseInt(id));

	fs.unlink(fileUtils.generateTransactionFilePath(id), (err) => {});

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

    let invalid = false;

    // FIXME: dates

    if (initialValue !== undefined && isNaN(parseFloat(initialValue))) invalid = true;
    if (finalValue !== undefined && isNaN(parseFloat(finalValue))) invalid = true;

    if (hasNif !== undefined && hasNif !== 'true' && hasNif !== 'false') invalid = true;
    if (hasFile !== undefined && hasFile !== 'true' && hasFile !== 'false') invalid = true;

    if (projects !== undefined && (
        !Array.isArray(projects) || !projects.every(v => parseFloat(v) % 1 === 0)
    )) invalid = true;

    if (balanceBy !== undefined && parseFloat(balanceBy) % 1 !== 0) invalid = true;

    // HELP: faz sentido checkar aqui os hardcoded values para orders? 
    if (orderBy !== undefined && orderBy === "") invalid = true;
    if (order !== undefined && order === "") invalid = true;

    if (limit !== undefined && parseFloat(limit) % 1 !== 0) invalid = true;

    if (invalid)
        return res.status(400).send("Invalid params");

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

module.exports = {
	createTransaction,
	getTransaction,
	downloadTransaction,
	updateTransaction,
	deleteTransaction,
	getAllTransactions
};
