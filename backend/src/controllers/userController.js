const User = require("../models/User");

async function createUser(req, res) {
	const pool = req.pool;
	const { username, name } = req.body;

	res.status(201).send(await User.createOne(pool, username, name));
}

async function getUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

	res.status(200).send(await User.getOne(pool, username));
}

async function updateUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;
	const { active, name, photo } = req.body;

	res.status(200).send(await User.updateOne(pool, username, active, name, photo));
}

async function deleteUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

	await User.deleteOne(pool, username);

	res.status(204).end();
}

async function getAllUsers(req, res) {
	const pool = req.pool;

	res.status(200).send(await User.getAll(pool));
}

module.exports = {
	createUser,
	getUser,
	updateUser,
	deleteUser,
	getAllUsers
};
