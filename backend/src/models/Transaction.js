const dateUtils = require("../utils/dateUtils");

class Transaction {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {date} date
	 * @param {string} description
	 * @param {float} value
	 * @param {boolean} hasFile
	 * @param {boolean} hasNif
	 * @param {Array<integer>} projects
	 * @returns {Object}
	 */
	async createOne(pool, date, description, value, hasFile, hasNif, projects) {
		const transactionId = (
			await pool.query(
				`INSERT INTO transactions (
            date,
            description,
            value,
            has_file,
            has_nif
        )
        VALUES
            (
                $1::date,
                $2::text,
                $3::numeric,
                $4::boolean,
                $5::boolean
            )
		RETURNING *;`,
				[date, description, value, hasFile, hasNif]
			)
		).rows[0].id;

		await Promise.all(
			projects.map(async (projectId) => {
				await pool.query(
					`INSERT INTO transaction_project (
                    transaction_id,
                    project_id
                )
                VALUES
                    (
                        $1::integer,
                        $2::integer
                        
                    )
                ON CONFLICT DO NOTHING;
                `,
					[transactionId, projectId]
				);
			})
		);

		await this.#triggerUpdateBalance(pool);

		return await this.getOne(pool, transactionId);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @returns {Object}
	 */
	async getOne(pool, id) {
		const res = (
			await pool.query(
				`
        SELECT
            transactions.id,
            transactions.date,
            transactions.description,
            transactions.value,
            transactions.balance,
            transactions.has_file,
            transactions.has_nif,
            string_agg(projects.name, ' / ') AS projects
        FROM
            transactions
        LEFT JOIN transaction_project
            ON transactions.id = transaction_project.transaction_id
        LEFT JOIN projects
            ON projects.id = transaction_project.project_id
        WHERE transactions.id = $1::integer
        GROUP BY transactions.id
    `,
				[id]
			)
		).rows[0];

		res.date = dateUtils.convertToLocalTimezone(res.date);
		res.value = parseFloat(res.value);
		res.balance = parseFloat(res.balance);
		return res;
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {date} date
	 * @param {string} description
	 * @param {float} value
	 * @param {boolean} hasFile
	 * @param {boolean} hasNif
	 * @param {Array<integer>} projects
	 * @returns {Object}
	 */
	async updateOne(pool, id, date, description, value, hasFile, hasNif, projects) {
		await pool.query(
			`
        UPDATE transactions 
        SET 
            date = $2::date,
            description = $3::text,
            value = $4::numeric,
            has_file = $5::boolean,
            has_nif = $6::boolean
        WHERE
            id = $1::integer;
        `,
			[id, date, description, value, hasFile, hasNif]
		);

		await pool.query(
			`
        DELETE FROM transaction_project 
        WHERE
            transaction_id = $1::integer;
        `,
			[id]
		);

		await Promise.all(
			projects.map(async (projectId) => {
				await pool.query(
					`
                INSERT INTO transaction_project (
                    transaction_id,
                    project_id
                )
                VALUES
                    (
                        $1::integer,
                        $2::integer
                    )
                ON CONFLICT DO NOTHING;`,
					[id, projectId]
				);
			})
		);

		await this.#triggerUpdateBalance(pool);

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
		DELETE FROM transactions
		WHERE id = $1::integer;
	`,
			[id]
		);

		await this.#triggerUpdateBalance(pool);
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {date} [initialDate=null]
	 * @param {date} [finalDate=null]
	 * @param {string} [initialMonth=null]
	 * @param {string} [finalMonth=null]
	 * @param {float} [initialValue=null]
	 * @param {float} [finalValue=null]
	 * @param {boolean} [hasNif=null]
	 * @param {boolean} [hasFile=null]
	 * @param {Array<integer>} [projects=[]]
	 * @param {string} [orderBy="date"]
	 * @param {string} [order="DESC"]
	 * @param {integer} [order=null]
	 * @returns {Array<Object>}
	 */
	async getAll(
		pool,
		initialDate = null,
		finalDate = null,
		initialMonth = null,
		finalMonth = null,
		initialValue = null,
		finalValue = null,
		hasNif = null,
		hasFile = null,
		projects = [],
		orderBy = "date",
		order = "DESC",
		limit = null
	) {
		let query = `
		SELECT
			transactions.id,
			transactions.date,
			transactions.description,
			transactions.value,
			transactions.balance,
			transactions.has_file,
			transactions.has_nif,
			string_agg(projects.name, ' / ') AS projects
		FROM
			transactions
		LEFT JOIN transaction_project
			ON transactions.id = transaction_project.transaction_id
		LEFT JOIN projects
			ON projects.id = transaction_project.project_id
		`;

		let filterConditions = [];
		let queryParams = [];

		if (initialDate !== null) {
			filterConditions.push(
				`transactions.date >= $${queryParams.length + 1}::date`
			);
			queryParams.push(initialDate);
		}

		if (finalDate !== null) {
			filterConditions.push(
				`transactions.date <= $${queryParams.length + 1}::date`
			);
			queryParams.push(finalDate);
		}

		if (initialMonth !== null) {
			filterConditions.push(
				`transactions.date >= $${queryParams.length + 1}::date`
			);
			queryParams.push(new Date(initialMonth + "-01"));
		}

		if (finalMonth !== null) {
			const finalMonthDate = new Date(finalMonth + "-01");
			finalMonthDate.setMonth(finalMonthDate.getMonth() + 1);
			finalMonthDate.setDate(0);

			filterConditions.push(
				`transactions.date <= $${queryParams.length + 1}::date`
			);
			queryParams.push(finalMonthDate);
		}

		if (initialValue !== null) {
			filterConditions.push(
				`transactions.value >= $${queryParams.length + 1}::numeric`
			);
			queryParams.push(initialValue);
		}

		if (finalValue !== null) {
			filterConditions.push(
				`transactions.value <= $${queryParams.length + 1}::numeric`
			);
			queryParams.push(finalValue);
		}

		if (hasNif !== null) {
			filterConditions.push(
				`transactions.has_nif = $${queryParams.length + 1}::boolean`
			);
			queryParams.push(hasNif);
		}

		if (hasFile !== null) {
			filterConditions.push(
				`transactions.has_file = $${queryParams.length + 1}::boolean`
			);
			queryParams.push(hasFile);
		}

		query +=
			filterConditions.length > 0 ? ` WHERE ${filterConditions.join(" AND ")}` : "";

		query += " GROUP BY transactions.id";

		if (projects.length !== 0) {
			query += ` HAVING bool_or(projects.id = ANY($${
				queryParams.length + 1
			}::int[]))`;
			queryParams.push(projects);
		}

		if (orderBy === "date" && (order === "ASC" || order === "DESC")) {
			query += ` ORDER BY date ${order}, id ${order}`;
		} else if (orderBy === "value" && (order === "ASC" || order === "DESC")) {
			query += ` ORDER BY value ${order}, date DESC`;
		} else {
			query += ` ORDER BY date DESC, id DESC`;
		}

		if (limit !== null) {
			query += ` LIMIT $${queryParams.length + 1}::integer`;
			queryParams.push(limit);
		}

		const res = await pool.query(query, queryParams);

		return res.rows.map((row) => {
			return {
				...row,
				date: dateUtils.convertToLocalTimezone(row.date),
				value: parseFloat(row.value),
				balance: parseFloat(row.balance)
			};
		});
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @returns {void}
	 */
	async #triggerUpdateBalance(pool) {
		await pool.query(
			`
		UPDATE transactions
		SET id = id
	`
		);
	}
}

module.exports = new Transaction();
