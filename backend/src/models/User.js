class User {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @param {string} name
	 * @returns {Object}
	 */
	async createOne(pool, username, name) {
		return (
			await pool.query(
				`INSERT INTO users (username, active, name) VALUES($1::text, $3::boolean, $2::text) RETURNING *;`,
				[username, name, false]
			)
		).rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @returns {Object}
	 */
	async getOne(pool, username) {
		return (
			await pool.query(`SELECT * FROM users WHERE username = $1::text`, [username])
		).rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @param {boolean} active
	 * @param {string} name
	 * @param {string} photo
	 * @returns {Object}
	 */
	async updateOne(pool, username, active, name, photo) {
		return (
			await pool.query(
				`
		UPDATE users
		SET active = $2::boolean,
			name = $3::text,
			photo = $4::text
		WHERE username = $1::text
		RETURNING *;
		`,
				[username, active, name, photo]
			)
		).rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} username
	 * @returns {Object}
	 */
	async deleteOne(pool, username) {
		return (await pool.query(`DELETE FROM users WHERE username = $1::text RETURNING *;`, [username])).rows[0]
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @returns {Array<Object>}
	 */
	async getAll(pool) {
		return (await pool.query(`SELECT * FROM users ORDER BY name;`)).rows;
	}
}

module.exports = new User();
