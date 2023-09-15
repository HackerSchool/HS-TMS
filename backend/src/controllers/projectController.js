const Project = require("../models/Project");

async function createProject(req, res) {
	const pool = req.pool;
	const { name, active } = req.body;

    if (name === undefined || typeof name !== 'string' || name === "" ||
        active === undefined || typeof active !== 'boolean')
        return res.status(400).send("Invalid params");

	res.status(201).send(await Project.createOne(pool, name, active));
}

async function getProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

    if (parseFloat(id) % 1 !== 0) // assure id is an integer
        return res.status(400).send("Invalid params");

    const project = await Project.getOne(pool, parseInt(id));

    if (project === undefined)
        return res.status(404).send("Project not found")

	res.status(200).send(project);
}

async function updateProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { name, active } = req.body;

    if (name === undefined || typeof name !== 'string' || name === "" ||
        active === undefined || typeof active !== 'boolean' ||
        parseFloat(id) % 1 !== 0)
        return res.status(400).send("Invalid params");

    const project = await Project.updateOne(pool, parseInt(id), name, active);

    if (project === undefined)
        return res.status(404).send("Project not found")

	res.status(200).send(project);
}

async function deleteProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

    if (parseFloat(id) % 1 !== 0)
        return res.status(400).send("Invalid params");

	await Project.deleteOne(pool, parseInt(id));

	res.status(204).end();
}

async function getAllProjects(req, res) {
	const pool = req.pool;

	const { initialBalance, finalBalance, active, orderBy, order } = req.query;

    let invalid = false;

    if (initialBalance !== undefined && isNaN(parseFloat(initialBalance))) invalid = true;
    if (finalBalance !== undefined && isNaN(parseFloat(finalBalance))) invalid = true;

    if (active !== undefined && active !== 'true' && active !== 'false') invalid = true;

    // HELP: faz sentido checkar aqui os hardcoded values para orders? sinto q isso deve
    // apenas estar no Model, já q isso está proximo da db, isto n, mas ya tu é q conheces
    // o MVC. Em cima checkei os valores hardcoded do active pq é um boolean, é JS
    if (orderBy !== undefined && orderBy === "") invalid = true;
    if (order !== undefined && order === "") invalid = true;

    if (invalid)
        return res.status(400).send("Invalid params");

	res.status(200).send(
		await Project.getAll(
			pool,
			initialBalance && parseFloat(initialBalance),
			finalBalance && parseFloat(finalBalance),
			active && JSON.parse(active),
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
