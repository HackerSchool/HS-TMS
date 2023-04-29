/**
 * @async
 * @param {Client} client
 * @param {string} username
 * @returns {void}
 */
async function createUser(client, username) {
	await client.connect();

	await client.query(`INSERT INTO users (username) VALUES($1::text);`, [username]);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {string} username
 * @returns {Object}
 */
async function searchUser(client, username) {
	await client.connect();

	const res = await client.query(`SELECT * FROM users WHERE username = $1::text`, [
		username
	]);

	await client.end();

	return res.rows[0];
}

/**
 * @async
 * @param {Client} client
 * @param {string} username
 * @returns {void}
 */
async function deleteUser(client, username) {
	await client.connect();

	await client.query(`DELETE FROM users WHERE username = $1::text;`, [username]);

	await client.end();
}

module.exports = {
	createUser,
	searchUser,
	deleteUser
};
