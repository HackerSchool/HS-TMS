/**
 * @async
 * @param {Client} client
 * @param {date} date
 * @param {string} description
 * @param {float} value
 * @param {float} balance
 * @param {string} file_path
 * @param {boolean} has_nif
 * @param {Array<integer>} projects
 * @returns {void}
 */
async function createTransaction(
	client,
	date,
	description,
	value,
	balance,
	file_path,
	has_nif,
	projects
) {
	await client.connect();

	await client.query(
		`INSERT INTO transactions (
            date,
            description,
            value,
			balance,
            file_path,
            has_nif
        )
        VALUES
            (
                $1::date,
                $2::text,
                $3::numeric,
                $4::numeric,
                $5::text,
                $6::boolean
            );`,
		[date, description, value, balance, file_path, has_nif]
	);

	const transaction_id = (
		await client.query(
			`SELECT
	        	*
			FROM transactions
			ORDER BY id DESC
			LIMIT 1`
		)
	).rows[0].id;

	await Promise.all(
		projects.map(async (project_id) => {
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
				[transaction_id, project_id]
			);
		})
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {Object}
 */
async function readTransaction(client, id) {
	await client.connect();

	const res = await client.query(
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

	await client.end();

	res.rows[0].date = res.rows[0].date.toISOString().substring(0, 10);
	res.rows[0].value = parseFloat(res.rows[0].value);
	res.rows[0].balance = parseFloat(res.rows[0].balance);
	return res.rows[0];
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @param {date} date
 * @param {string} description
 * @param {float} value
 * @param {float} balance
 * @param {string} file_path
 * @param {boolean} has_nif
 * @param {Array<integer>} projects
 * @returns {void}
 */
async function updateTransaction(
	client,
	id,
	date,
	description,
	value,
	balance,
	file_path,
	has_nif,
	projects
) {
	await client.connect();

	await client.query(
		`
        UPDATE transactions 
        SET 
            date = $2::date,
            description = $3::text,
            value = $4::numeric,
            balance = $5::numeric,
            file_path = $6::text,
            has_nif = $7::boolean
        WHERE
            id = $1::integer;
        `,
		[id, date, description, value, balance, file_path, has_nif]
	);

	await client.query(
		`
        DELETE FROM transaction_project 
        WHERE
            transaction_id = $1::integer;
        `,
		[id]
	);

	await Promise.all(
		projects.map(async (project_id) => {
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
				[id, project_id]
			);
		})
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {integer} id
 * @returns {void}
 */
async function deleteTransaction(client, id) {
	await client.connect();

	await client.query(
		`
		DELETE FROM transactions
		WHERE id = $1::integer;
	`,
		[id]
	);

	await client.end();
}

/**
 * @async
 * @param {Client} client
 * @param {date} [initial_month="2000-01"]
 * @param {date} [final_month="3000-01"]
 * @param {Array<integer>} [projects=[]]
 * @returns {Array<Object>}
 */
async function listTransactions(
	client,
	initial_month = "2000-01",
	final_month = "3000-01",
	projects = []
) {
	await client.connect();

	const initialMonthDate = new Date(initial_month + "-01");

	const finalMonthDate = new Date(final_month + "-01");
	finalMonthDate.setMonth(finalMonthDate.getMonth() + 1);
	finalMonthDate.setDate(0);

	const res = await client.query(
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
		WHERE transactions.date >= $1::date
			AND transactions.date <= $2::date
		GROUP BY transactions.id
		${projects.length !== 0 ? "HAVING bool_or(projects.id = ANY($3::int[]))" : ""}
        `,
		projects.length !== 0
			? [initialMonthDate, finalMonthDate, projects]
			: [initialMonthDate, finalMonthDate]
	);

	await client.end();

	return res.rows.map((row) => {
		return {
			...row,
			date: row.date.toISOString().substring(0, 10),
			value: parseFloat(row.value),
			balance: parseFloat(row.balance)
		};
	});
}

module.exports = {
	createTransaction,
	readTransaction,
	updateTransaction,
	deleteTransaction,
	listTransactions
};
