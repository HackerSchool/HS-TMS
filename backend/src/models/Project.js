class Project {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} name
	 * @param {boolean} active
	 * @returns {void}
	 */
	async createOne(pool, name, active) {
		await pool.query(
			`INSERT INTO projects (name, active) VALUES($1::text, $2::boolean);`,
			[name, active]
		);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async getOne(pool, id) {
		const res = await pool.query(`SELECT * FROM projects WHERE id = $1::integer`, [
			id
		]);

		return res.rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {string} name
	 * @param {boolean} active
	 * @returns {void}
	 */
	async updateOne(pool, id, name, active) {
		await pool.query(
			`
		UPDATE projects
		SET name = $2::text,
			active = $3::boolean
		WHERE id = $1::integer;
	`,
			[id, name, active]
		);
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
		DELETE FROM projects
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
		const res = await pool.query(`SELECT * FROM projects`);

		return res.rows;
	}
}

module.exports = new Project();
