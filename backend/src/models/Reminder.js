const dateUtils = require("../utils/dateUtils");

class Reminder {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} title
	 * @param {string} description
	 * @param {date} date
	 * @returns {Object}
	 */
	async createOne(pool, title, description, date) {
		const res = (
			await pool.query(
				`INSERT INTO reminders (title, description, date) VALUES($1::text, $2::text, $3::date) RETURNING *;`,
				[title, description, date]
			)
		).rows[0];

		res.date = dateUtils.convertToLocalTimezone(res.date);
		return res;
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async getOne(pool, id) {
		const res = (
			await pool.query(`SELECT * FROM reminders WHERE id = $1::integer`, [id])
		).rows[0];

		if (res) res.date = dateUtils.convertToLocalTimezone(res.date);
		return res;
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {string} title
	 * @param {string} description
	 * @param {date} date
	 * @returns {Object}
	 */
	async updateOne(pool, id, title, description, date) {
		const res = (
			await pool.query(
				`
		UPDATE reminders
		SET title = $2::text,
			description = $3::text,
			date = $4::date
		WHERE id = $1::integer
		RETURNING *;
		`,
				[id, title, description, date]
			)
		).rows[0];

		if (res) res.date = dateUtils.convertToLocalTimezone(res.date);
		return res;
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async deleteOne(pool, id) {
		const res = (
			await pool.query(
				`
		DELETE FROM reminders
		WHERE id = $1::integer
        RETURNING *;
	    `,
				[id]
			)
		).rows[0];

		if (res) res.date = dateUtils.convertToLocalTimezone(res.date);
		return res;
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {boolean} pendingNotification
	 * @returns {Array<Object>}
	 */
	async getAll(pool, pendingNotification = false) {
		let query;

		if (pendingNotification) {
			query = ` 
				SELECT
					*,
					(CURRENT_DATE = date) AS today
				FROM
					reminders
				WHERE
					(NOT notified AND CURRENT_DATE >= date - INTERVAL '7 days')
					OR (CURRENT_DATE = date)
				ORDER BY date
			`;
		} else {
			query = `SELECT * FROM reminders ORDER BY date`;
		}

		const res = await pool.query(query);

		return res.rows.map((row) => {
			return {
				...row,
				date: dateUtils.convertToLocalTimezone(row.date)
			};
		});
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {boolean} value
	 * @returns {Object}
	 */
	async setNotified(pool, id, value) {
		const res = (
			await pool.query(
				`
				UPDATE reminders
				SET notified = $2::boolean
				WHERE id = $1::integer
				RETURNING *;
			`,
				[id, value]
			)
		).rows[0];

		if (res) res.date = dateUtils.convertToLocalTimezone(res.date);
		return res;
	}
}

module.exports = new Reminder();
