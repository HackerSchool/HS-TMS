const Project = require("../models/Project");
const { emailLoggerFn } = require("../modules/logging");

async function createProject(req, res) {
	const pool = req.pool;
	const { name, active, symbolic } = req.body;

	// input validation
	if (
		name === undefined ||
		typeof name !== "string" ||
		name === "" ||
		active === undefined ||
		typeof active !== "boolean" ||
		symbolic === undefined ||
		typeof symbolic !== "boolean"
	)
		return res.status(400).send("Invalid params");

	const project = await Project.createOne(pool, name, active, symbolic);
	res.status(201).send(project);

	emailLoggerFn(req.user.name, "Project", req.method, null, project);
}

async function getProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	// input validation
	if (!Number.isInteger(parseFloat(id)))
		// assure id is an integer
		return res.status(400).send("Invalid params");

	const project = await Project.getOne(pool, parseInt(id));

	if (project === undefined) return res.status(404).send("Project not found");

	res.status(200).send(project);
}

async function updateProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { name, active } = req.body;

	// input validation
	if (
		name === undefined ||
		typeof name !== "string" ||
		name === "" ||
		active === undefined ||
		typeof active !== "boolean" ||
		!Number.isInteger(parseFloat(id))
	)
		return res.status(400).send("Invalid params");

	const oldProject = await Project.getOne(pool, parseInt(id));
	const project = await Project.updateOne(pool, parseInt(id), name, active);

	if (project === undefined) return res.status(404).send("Project not found");

	res.status(200).send(project);

	emailLoggerFn(req.user.name, "Project", req.method, oldProject, project);
}

async function deleteProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	// input validation
	if (!Number.isInteger(parseFloat(id))) return res.status(400).send("Invalid params");

	const deletedProject = await Project.deleteOne(pool, parseInt(id));

	if (deletedProject === undefined) return res.status(404).send("Project not found");

	res.status(204).end();

	emailLoggerFn(req.user.name, "Project", req.method, deletedProject, null);
}

async function getAllProjects(req, res) {
	const pool = req.pool;

	const { initialBalance, finalBalance, active, symbolic, orderBy, order } = req.query;

	// input validation
	try {
		if (initialBalance !== undefined && isNaN(parseFloat(initialBalance)))
			throw Error();
		if (finalBalance !== undefined && isNaN(parseFloat(finalBalance))) throw Error();

		if (active !== undefined && active !== "true" && active !== "false")
			throw Error();

		if (symbolic !== undefined && symbolic !== "true" && symbolic !== "false")
			throw Error();

		if (orderBy !== undefined && !(orderBy === "name" || orderBy === "balance"))
			throw Error();
		if (order !== undefined && !(order === "ASC" || order === "DESC")) throw Error();
	} catch (err) {
		return res.status(400).send("Invalid params");
	}

	res.status(200).send(
		await Project.getAll(
			pool,
			initialBalance && parseFloat(initialBalance),
			finalBalance && parseFloat(finalBalance),
			active && JSON.parse(active),
			symbolic && JSON.parse(symbolic),
			orderBy,
			order
		)
	);
}

module.exports = {
	createProject,
	getProject,
	updateProject,
	deleteProject,
	getAllProjects
};
