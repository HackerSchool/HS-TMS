const pool = require("../models/pool")

function selectPool(req, res, next) {
	req.pool = pool;
	next();
}

module.exports = selectPool;
