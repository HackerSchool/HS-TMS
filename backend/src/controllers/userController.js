const User = require("../models/User");

async function createUser(req, res) {
	const pool = req.pool;
	const { username } = req.body;

	res.status(201).send(await User.createOne(pool, username));
}

async function getUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

	res.status(200).send(await User.getOne(pool, username));
}

async function deleteUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

	await User.deleteOne(pool, username);

	res.status(204).end();
}

module.exports = {
	createUser,
	getUser,
	deleteUser
};
