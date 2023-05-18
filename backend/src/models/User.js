class User {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @returns {void}
	 */
	async createOne(pool, username) {
		await pool.query(`INSERT INTO users (username) VALUES($1::text);`, [username]);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @returns {Object}
	 */
	async getOne(pool, username) {
		const res = await pool.query(`SELECT * FROM users WHERE username = $1::text`, [
			username
		]);

		return res.rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @returns {void}
	 */
	async deleteOne(pool, username) {
		await pool.query(`DELETE FROM users WHERE username = $1::text;`, [username]);
	}
}

module.exports = new User();
