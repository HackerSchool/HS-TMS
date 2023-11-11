class Project {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {string} name
	 * @param {boolean} active
	 * @param {boolean} defaultProject
	 * @returns {Object}
	 */
	async createOne(pool, name, active, defaultProject) {
		const projectId = (
			await pool.query(
				`INSERT INTO projects (name, active, "default") VALUES($1::text, $2::boolean, $3::boolean) RETURNING *;`,
				[name, active, defaultProject]
			)
		).rows[0].id;

		return await this.getOne(pool, projectId);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async getOne(pool, id) {
		return (
			await pool.query(
				`
			SELECT
				*
			FROM (
				SELECT
					p.*,
					COUNT(tp.transaction_id)::integer AS transaction_count,
					ROUND(COALESCE(SUM(t.value / project_count), 0), 2)::float AS balance
				FROM
					projects p
				LEFT JOIN
					transaction_project tp ON p.id = tp.project_id
				LEFT JOIN
					transactions t ON tp.transaction_id = t.id
				LEFT JOIN (
					SELECT
						tp2.transaction_id,
						COUNT(tp2.project_id) AS project_count
					FROM
						transaction_project tp2
					GROUP BY
						tp2.transaction_id
				) AS num_projects ON t.id = num_projects.transaction_id
				GROUP BY p.id
			) AS projects
			WHERE id = $1::integer
			`,
				[id]
			)
		).rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {string} name
	 * @param {boolean} active
	 * @returns {Object}
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

		return await this.getOne(pool, id);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async deleteOne(pool, id) {
		return (
			await pool.query(
				`
				DELETE FROM projects
				WHERE id = $1::integer
				RETURNING *;
				`,
				[id]
			)
		).rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {float} [initialBalance=null]
	 * @param {float} [finalBalance=null]
	 * @param {boolean} [active=null]
	 * @param {boolean} [defaultProject=null]
	 * @param {string} [orderBy="name"]
	 * @param {string} [order="ASC"]
	 * @returns {Array<Object>}
	 */
	async getAll(
		pool,
		initialBalance = null,
		finalBalance = null,
		active = null,
		defaultProject = null,
		orderBy = "name",
		order = "ASC"
	) {
		let query = `
		SELECT
			*
		FROM (
			SELECT
				p.*,
				COUNT(tp.transaction_id)::integer AS transaction_count,
				ROUND(COALESCE(SUM(t.value / project_count), 0), 2)::float AS balance
			FROM
				projects p
			LEFT JOIN
				transaction_project tp ON p.id = tp.project_id
			LEFT JOIN
				transactions t ON tp.transaction_id = t.id
			LEFT JOIN (
				SELECT
					tp2.transaction_id,
					COUNT(tp2.project_id) AS project_count
				FROM
					transaction_project tp2
				GROUP BY
					tp2.transaction_id
			) AS num_projects ON t.id = num_projects.transaction_id
			GROUP BY p.id
		) AS projects
		`;

		let filterConditions = [];
		let queryParams = [];

		if (initialBalance !== null) {
			filterConditions.push(`balance >= $${queryParams.length + 1}::numeric`);
			queryParams.push(initialBalance);
		}

		if (finalBalance !== null) {
			filterConditions.push(`balance <= $${queryParams.length + 1}::numeric`);
			queryParams.push(finalBalance);
		}

		if (active !== null) {
			filterConditions.push(`active = $${queryParams.length + 1}::boolean`);
			queryParams.push(active);
		}

		if (defaultProject !== null) {
			filterConditions.push(`"default" = $${queryParams.length + 1}::boolean`);
			queryParams.push(defaultProject);
		}

		query +=
			filterConditions.length > 0 ? ` WHERE ${filterConditions.join(" AND ")}` : "";

		if (orderBy === "name" && (order === "ASC" || order === "DESC")) {
			query += ` ORDER BY name ${order}`;
		} else if (orderBy === "balance" && (order === "ASC" || order === "DESC")) {
			query += ` ORDER BY balance ${order}, name ASC`;
		} else {
			query += ` ORDER BY name ASC`;
		}

		return (await pool.query(query, queryParams)).rows;
	}

	/**
	 * @async
	 * @param {pg.pool} pool
	 * @param {Array<integer>} ids
	 * @returns {string}
	 */
	async getNamesByIds(pool, ids = null) {
		let query = `
		SELECT
			string_agg(name, ' / ') AS projects
		FROM
			projects
		`;
		let queryParams = [];

		if (ids !== null && ids.length !== 0) {
			query += ` WHERE id = ANY($1::int[])`;
			queryParams.push(ids);
		}

		return (await pool.query(query, queryParams)).rows[0].projects;
	}

	/**
	 * @async
	 * @param {pg.pool} pool
	 * @param {Array<integer>} ids
	 * @returns {boolean}
	 */
	async assertAllExist(pool, ids) {
		const missingIds = (
			await pool.query(
				`
            SELECT unnest($1::int[]) AS project_id
            FROM unnest($1::int[]) AS project_ids(project_id)
            WHERE project_id NOT IN (SELECT id FROM projects);
            `,
				[ids]
			)
		).rows[0];

		return missingIds === undefined;
	}
}

module.exports = new Project();
