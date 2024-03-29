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
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const transactionId = (
        await client.query(
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
          [date, description, value, hasFile, hasNif],
        )
      ).rows[0].id;

      if (projects)
        await Promise.all(
          projects.map(async (projectId) => {
            await client.query(
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
              [transactionId, projectId],
            );
          }),
        );

      await client.query("COMMIT");

      return await this.getOne(client, transactionId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
        [id],
      )
    ).rows[0];

    if (res) {
      res.date = dateUtils.dateToString(res.date);
      res.value = parseFloat(res.value);
    }
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
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
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
        [id, date, description, value, hasFile, hasNif],
      );

      await client.query(
        `
			DELETE FROM transaction_project 
			WHERE
				transaction_id = $1::integer;
			`,
        [id],
      );

      if (projects)
        await Promise.all(
          projects.map(async (projectId) => {
            await client.query(
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
              [id, projectId],
            );
          }),
        );

      await client.query("COMMIT");

      return await this.getOne(client, id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
		DELETE FROM transactions
		WHERE id = $1::integer
        RETURNING *;
	    `,
        [id],
      )
    ).rows[0];

    if (res) {
      res.date = dateUtils.dateToString(res.date);
      res.value = parseFloat(res.value);
    }
    return res;
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
   * @param {integer} [balanceBy=null]
   * @param {string} [orderBy="date"]
   * @param {string} [order="DESC"]
   * @param {integer} [limit=null]
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
    balanceBy = null,
    orderBy = "date",
    order = "DESC",
    limit = null,
  ) {
    let query = `
		SELECT
			*
		FROM
			(
			SELECT
				transactions.id,
				transactions.date,
				transactions.description,
				transactions.value,
				SUM(transactions.value) OVER (ORDER BY transactions.date ASC, transactions.id ASC) AS balance,
				transactions.has_file,
				transactions.has_nif,
				string_agg(projects.name, ' / ') AS projects
			FROM
				transactions
			LEFT JOIN transaction_project
				ON transactions.id = transaction_project.transaction_id
			LEFT JOIN projects
				ON projects.id = transaction_project.project_id
			{ where }
			GROUP BY transactions.id
			) AS subquery
		`;

    let filterConditions = [];
    let queryParams = [];

    if (balanceBy !== null) {
      query = query.replace("{ where }", `WHERE projects.id = $${queryParams.length + 1}::integer`);
      queryParams.push(balanceBy);
    } else {
      query = query.replace("{ where }", "");
    }

    if (initialDate !== null) {
      filterConditions.push(`date >= $${queryParams.length + 1}::date`);
      queryParams.push(initialDate);
    }

    if (finalDate !== null) {
      filterConditions.push(`date <= $${queryParams.length + 1}::date`);
      queryParams.push(finalDate);
    }

    if (initialMonth !== null) {
      filterConditions.push(`date >= $${queryParams.length + 1}::date`);
      queryParams.push(new Date(initialMonth + "-01"));
    }

    if (finalMonth !== null) {
      const finalMonthDate = new Date(finalMonth + "-01");
      finalMonthDate.setMonth(finalMonthDate.getMonth() + 1);
      finalMonthDate.setDate(0);

      filterConditions.push(`date <= $${queryParams.length + 1}::date`);
      queryParams.push(finalMonthDate);
    }

    if (initialValue !== null) {
      filterConditions.push(`value >= $${queryParams.length + 1}::numeric`);
      queryParams.push(initialValue);
    }

    if (finalValue !== null) {
      filterConditions.push(`value <= $${queryParams.length + 1}::numeric`);
      queryParams.push(finalValue);
    }

    if (hasNif !== null) {
      filterConditions.push(`has_nif = $${queryParams.length + 1}::boolean`);
      queryParams.push(hasNif);
    }

    if (hasFile !== null) {
      filterConditions.push(`has_file = $${queryParams.length + 1}::boolean`);
      queryParams.push(hasFile);
    }

    if (projects !== null && projects.length !== 0) {
      filterConditions.push(`EXISTS (
				SELECT 1
				FROM transaction_project
				WHERE transaction_project.transaction_id = id
					AND transaction_project.project_id = ANY($${queryParams.length + 1}::int[])
			)`);
      queryParams.push(projects);
    }

    query += filterConditions.length > 0 ? ` WHERE ${filterConditions.join(" AND ")}` : "";

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
        date: dateUtils.dateToString(row.date),
        value: parseFloat(row.value),
        balance: parseFloat(row.balance),
      };
    });
  }
}

module.exports = new Transaction();
