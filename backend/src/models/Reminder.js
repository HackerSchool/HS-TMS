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
		const res = await pool.query(
			`INSERT INTO reminders (title, description, date) VALUES($1::text, $2::text, $3::date) RETURNING *;`,
			[title, description, date]
		);

		return await this.getOne(pool, res.rows[0].id);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async getOne(pool, id) {
		const res = await pool.query(`SELECT * FROM reminders WHERE id = $1::integer`, [
			id
		]);

		res.rows[0].date = dateUtils.convertToLocalTimezone(res.rows[0].date);
		return res.rows[0];
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
		);

		return await this.getOne(pool, id);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {void}
	 */
	async deleteOne(pool, id) {
		await pool.query(
			`
		DELETE FROM reminders
		WHERE id = $1::integer;
	`,
			[id]
		);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @returns {Array<Object>}
	 */
	async getAll(pool) {
		const res = await pool.query(`SELECT * FROM reminders ORDER BY date`);

		return res.rows.map((row) => {
			return {
				...row,
				date: dateUtils.convertToLocalTimezone(row.date)
			};
		});
	}
}

module.exports = new Reminder();
