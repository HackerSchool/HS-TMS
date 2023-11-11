const User = require("../models/User");

async function createUser(req, res) {
	const pool = req.pool;
	const { username, name } = req.body;

    if (username === undefined || typeof username !== 'string' ||
        !username.match(/^ist[0-9]+$/g) ||
        name === undefined || typeof name !== 'string')
        return res.status(400).send("Invalid params");

	res.status(201).send(await User.createOne(pool, username, name));
}

async function deleteUser(req, res) {
	const pool = req.pool;
	const { username } = req.params;

    if (!username.match(/^ist[0-9]+$/g))
        return res.status(400).send("Invalid params");

	const deletedUser = await User.deleteOne(pool, username);

    if (deletedUser === undefined)
        return res.status(404).send("User not found");

	res.status(204).end();
}

async function getAllUsers(req, res) {
	const pool = req.pool;

	res.status(200).send(await User.getAll(pool));
}

module.exports = {
	createUser,
	deleteUser,
	getAllUsers
};
