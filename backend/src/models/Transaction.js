const dateUtils = require("../utils/dateUtils");

class Transaction {
	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {date} date
	 * @param {string} description
	 * @param {float} value
	 * @param {string} filePath
	 * @param {boolean} hasNif
	 * @param {Array<integer>} projects
	 * @returns {Object}
	 */
	async createOne(pool, date, description, value, filePath, hasNif, projects) {
		const res = await pool.query(
			`INSERT INTO transactions (
            date,
            description,
            value,
            file_path,
            has_nif
        )
        VALUES
            (
                $1::date,
                $2::text,
                $3::numeric,
                $4::text,
                $5::boolean
            )
		RETURNING *;`,
			[date, description, value, filePath, hasNif]
		);

		const transactionId = res.rows[0].id;

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
		const res = await pool.query(
			`
        SELECT
            transactions.id,
            transactions.date,
            transactions.description,
            transactions.value,
            transactions.balance,
            transactions.file_path,
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
		);

		res.rows[0].date = dateUtils.convertToLocalTimezone(res.rows[0].date);
		res.rows[0].value = parseFloat(res.rows[0].value);
		res.rows[0].balance = parseFloat(res.rows[0].balance);
		return res.rows[0];
	}

	/**
	 * @async
	 * @param {pg.Pool} pool
	 * @param {integer} id
	 * @param {date} date
	 * @param {string} description
	 * @param {float} value
	 * @param {string} filePath
	 * @param {boolean} hasNif
	 * @param {Array<integer>} projects
	 * @returns {Object}
	 */
	async updateOne(pool, id, date, description, value, filePath, hasNif, projects) {
		await pool.query(
			`
        UPDATE transactions 
        SET 
            date = $2::date,
            description = $3::text,
            value = $4::numeric,
            file_path = $5::text,
            has_nif = $6::boolean
        WHERE
            id = $1::integer;
        `,
			[id, date, description, value, filePath, hasNif]
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
	 * @param {date} [initialMonth="2000-01"]
	 * @param {date} [finalMonth="3000-01"]
	 * @param {float} [initialValue=Number.NEGATIVE_INFINITY]
	 * @param {float} [finalValue=Number.POSITIVE_INFINITY]
	 * @param {boolean} [hasNif=null]
	 * @param {Array<integer>} [projects=[]]
	 * @param {string} [orderBy="date"]
	 * @param {string} [order="DESC"]
	 * @returns {Array<Object>}
	 */
	async getAll(
		pool,
		initialMonth = "2000-01",
		finalMonth = "3000-01",
		initialValue = Number.NEGATIVE_INFINITY,
		finalValue = Number.POSITIVE_INFINITY,
		hasNif = null,
		projects = [],
		orderBy = "date",
		order = "DESC"
	) {
		const initialMonthDate = new Date(initialMonth + "-01");

		const finalMonthDate = new Date(finalMonth + "-01");
		finalMonthDate.setMonth(finalMonthDate.getMonth() + 1);
		finalMonthDate.setDate(0);

		let query = `
		SELECT
			transactions.id,
			transactions.date,
			transactions.description,
			transactions.value,
			transactions.balance,
			transactions.file_path,
			transactions.has_nif,
			string_agg(projects.name, ' / ') AS projects
		FROM
			transactions
		LEFT JOIN transaction_project
			ON transactions.id = transaction_project.transaction_id
		LEFT JOIN projects
			ON projects.id = transaction_project.project_id
		WHERE transactions.date >= $1::date
			AND transactions.date <= $2::date
			AND transactions.value BETWEEN $3::numeric AND $4::numeric
		`;

		let queryParams = [initialMonthDate, finalMonthDate, initialValue, finalValue];

		if (hasNif !== null) {
			query += ` AND transactions.has_nif = $${queryParams.length + 1}::boolean`;
			queryParams.push(hasNif);
		}

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
