/**
 * @async
 * @param {Client} client
 * @param {string} name
 * @param {string} value
 * @returns {void}
 */
async function createVariable(client, name, value) {
	await client.connect();

	await client.query(
		`INSERT INTO variables (name, value) VALUES($1::text, $2::text);`,
		[name, value]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {string} name
 * @returns {Object}
 */
async function readVariable(client, name) {
	await client.connect();

	const res = await client.query(`SELECT * FROM variables WHERE name = $1::text`, [
		name
	]);

	await client.end();

	return res.rows[0];
}

/**
 * @async
 * @param {Client} client
 * @param {string} name
 * @param {string} value
 * @returns {void}
 */
async function updateVariable(client, name, value) {
	await client.connect();

	await client.query(
		`
		UPDATE variables
		SET value = $2::text
		WHERE name = $1::text;
	`,
		[name, value]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {string} name
 * @returns {void}
 */
async function deleteVariable(client, name) {
	await client.connect();

	await client.query(
		`
		DELETE FROM variables
		WHERE name = $1::text;
	`,
		[name]
	);

	await client.end();
}

module.exports = {
	createVariable,
	readVariable,
	updateVariable,
	deleteVariable
};
