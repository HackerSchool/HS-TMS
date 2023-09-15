const User = require("../models/User");

async function createUser(req, res) {
	const pool = req.pool;
	const { username, name } = req.body;

    if (username === undefined || typeof username !== 'string' ||
        name === undefined || typeof name !== 'string')
        return res.status(400).send("Invalid params");

	res.status(201).send(await User.createOne(pool, username, name));
}

async function getUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

    const user = await User.getOne(pool, username);

    if (user === undefined)
        return res.status(404).send("User not found");

	res.status(200).send(user);
}

// HELP: apagar?
async function updateUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;
	const { active, name, photo } = req.body;

    const user = await User.updateOne(pool, username, active, name, photo);

    if (user === undefined)
        return res.status(404).send("User not found");

	res.status(200).send(user);
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
