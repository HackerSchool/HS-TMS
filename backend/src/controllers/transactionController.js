const fs = require("fs");
const Transaction = require("../models/Transaction");
const Project = require("../models/Project");
const fileUtils = require("../utils/fileUtils");
const { isValidDate } = require("../utils/dateUtils");

async function createTransaction(req, res) {
	const pool = req.pool;
	const { date, description, value, hasNif, projects } = req.body;

    // input validation
    try {
        if (!isValidDate(date)) throw Error();

        if (value === undefined || typeof value !== 'number') throw Error();
    
        if (hasNif === undefined || typeof hasNif !== 'boolean') throw Error();
    
        if (description !== undefined && typeof description !== 'string') throw Error();
    
        if (projects !== undefined && (
            !Array.isArray(projects) ||
            !projects.every(v => Number.isInteger(parseFloat(v))) ||
            !(await Project.assertAllExist(pool, projects))
        )) throw Error();
    } catch (err) {
        return res.status(400).send("Invalid params");
    }

	if (req.files && Object.keys(req.files).length !== 0) {
        const uploadedFile = req.files.receipt;

        // Assure receipt file type is pdf
        if (uploadedFile.mimetype !== "application/pdf" ||
            !uploadedFile.name.endsWith(".pdf"))
            return res.status(400).send("Invalid params");

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
	                fs.unlink(fileUtils.generateTransactionFilePath(transaction.id), (err) => {});
					res.status(500).send("Receipt upload failed");
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

    // input validation
    if (!Number.isInteger(parseFloat(id)))
        return res.status(400).send("Invalid params");

    const transaction = await Transaction.getOne(pool, parseInt(id));

    if (transaction === undefined)
        return res.status(404).send("Transaction not found");

	res.status(200).send(transaction);
}

async function downloadTransaction(req, res) {
	const { id } = req.params;

    // input validation
    if (!Number.isInteger(parseFloat(id)))
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

    // input validation
    try {
        if (!Number.isInteger(parseFloat(id))) throw Error();

        if (!isValidDate(date)) throw Error();

        if (value === undefined || typeof value !== 'number') throw Error();

        if (hasNif === undefined || typeof hasNif !== 'boolean') throw Error();

        if (hasFile === undefined || typeof hasFile !== 'boolean') throw Error();

        if (description !== undefined && typeof description !== 'string') throw Error();

        if (projects !== undefined && (
            !Array.isArray(projects) ||
            !projects.every(v => Number.isInteger(parseFloat(v))) ||
            !(await Project.assertAllExist(pool, projects))
        )) throw Error();
    } catch (err) {
        return res.status(400).send("Invalid params");
    }

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

    // input validation
    if (!Number.isInteger(parseFloat(id)))
        return res.status(400).send("Invalid params");

	const deletedTransaction = await Transaction.deleteOne(pool, parseInt(id));

    if (deletedTransaction === undefined)
        return res.status(404).send("Transaction not found");

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

    // input validation
    try {
        if (initialDate !== undefined && !isValidDate(initialDate)) throw Error();
        if (finalDate !== undefined && !isValidDate(finalDate)) throw Error();
        if (initialMonth !== undefined && !isValidDate(initialMonth, true)) throw Error();
        if (finalMonth !== undefined && !isValidDate(finalMonth, true)) throw Error();
    
        if (initialValue !== undefined && isNaN(parseFloat(initialValue))) throw Error();
        if (finalValue !== undefined && isNaN(parseFloat(finalValue))) throw Error();
    
        if (hasNif !== undefined && hasNif !== 'true' && hasNif !== 'false') throw Error();
        if (hasFile !== undefined && hasFile !== 'true' && hasFile !== 'false') throw Error();
    
        if (projects !== undefined && (
            !Array.isArray(JSON.parse(projects)) ||
            !JSON.parse(projects).every(v => Number.isInteger(parseFloat(v))) ||
            !(await Project.assertAllExist(pool, JSON.parse(projects)))
        )) throw Error();
    
        if (balanceBy !== undefined && !Number.isInteger(parseFloat(balanceBy))) throw Error();
    
        if (orderBy !== undefined && !(orderBy === "date" || orderBy === "value")) throw Error();
        if (order !== undefined && !(order === "ASC" || order === "DESC")) throw Error();
    
        if (limit !== undefined && !Number.isInteger(parseFloat(limit))) throw Error();
    } catch (err) {
        return res.status(400).send("Invalid params");
    }

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
			balanceBy && parseInt(balanceBy),
			orderBy,
			order,
			limit && parseInt(limit)
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
