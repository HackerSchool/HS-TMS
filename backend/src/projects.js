/**
 * @async
 * @param {Client} client
 * @param {string} name
 * @param {boolean} active
 * @returns {void}
 */
async function createProject(client, name, active) {
	await client.connect();

	await client.query(
		`INSERT INTO projects (project_name, active) VALUES($1::text, $2::boolean);`,
		[name, active]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {Object}
 */
async function readProject(client, id) {
	await client.connect();

	const res = await client.query(`SELECT * FROM projects WHERE id = $1::integer`, [id]);

	await client.end();

	return res.rows[0];
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @param {string} name
 * @param {boolean} active
 * @returns {void}
 */
async function updateProject(client, id, name, active) {
	await client.connect();

	await client.query(
		`
		UPDATE projects
		SET project_name = $2::text,
			active = $3::boolean
		WHERE id = $1::integer;
	`,
		[id, name, active]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {void}
 */
async function deleteProject(client, id) {
	await client.connect();

	await client.query(
		`
		DELETE FROM projects
		WHERE id = $1::integer;
	`,
		[id]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @returns {Array<Object>}
 */
async function listProjects(client) {
	await client.connect();

	const res = await client.query(`SELECT * FROM projects`);

	await client.end();

	return res.rows;
}

module.exports = {
	createProject,
	readProject,
	updateProject,
	deleteProject,
	listProjects
};
