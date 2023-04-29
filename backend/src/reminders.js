/**
 * @async
 * @param {Client} client
 * @param {string} title
 * @param {string} description
 * @param {date} date
 * @returns {void}
 */
async function createReminder(client, title, description, date) {
	await client.connect();

	await client.query(
		`INSERT INTO reminders (title, description, date) VALUES($1::text, $2::text, $3::date);`,
		[title, description, date]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {Object}
 */
async function readReminder(client, id) {
	await client.connect();

	const res = await client.query(`SELECT * FROM reminders WHERE id = $1::integer`, [
		id
	]);

	await client.end();

	res.rows[0].date = res.rows[0].date.toISOString().substring(0, 10);
	return res.rows[0];
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @param {string} title
 * @param {string} description
 * @param {date} date
 * @returns {void}
 */
async function updateReminder(client, id, title, description, date) {
	await client.connect();

	await client.query(
		`
		UPDATE reminders
		SET title = $2::text,
			description = $3::text,
			date = $4::date
		WHERE id = $1::integer;
	`,
		[id, title, description, date]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {void}
 */
async function deleteReminder(client, id) {
	await client.connect();

	await client.query(
		`
		DELETE FROM reminders
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
async function listReminders(client) {
	await client.connect();

	const res = await client.query(`SELECT * FROM reminders`);

	await client.end();

	return res.rows.map((row) => {
		return {
			...row,
			date: row.date.toISOString().substring(0, 10)
		};
	});
}

module.exports = {
	createReminder,
	readReminder,
	updateReminder,
	deleteReminder,
	listReminders
};
