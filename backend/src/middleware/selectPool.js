const { Pool } = require("pg");

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT
});

function selectPool(req, res, next) {
	req.pool = pool;
	next();
}

module.exports = selectPool;
