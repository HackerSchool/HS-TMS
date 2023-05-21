const Project = require("../models/Project");

async function createProject(req, res) {
	const pool = req.pool;
	const { name, active } = req.body;

	res.status(201).send(await Project.createOne(pool, name, active));
}

async function getProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	res.status(200).send(await Project.getOne(pool, id));
}

async function updateProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;
	const { name, active } = req.body;

	res.status(200).send(await Project.updateOne(pool, id, name, active));
}

async function deleteProject(req, res) {
	const pool = req.pool;
	const { id } = req.params;

	await Project.deleteOne(pool, id);

	res.status(204).end();
}

async function getAllProjects(req, res) {
	const pool = req.pool;

	res.status(200).send(await Project.getAll(pool));
}

module.exports = {
	createProject,
	getProject,
	updateProject,
	deleteProject,
	getAllProjects
};
