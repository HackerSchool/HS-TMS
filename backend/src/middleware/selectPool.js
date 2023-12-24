const pool = require("../models/pool")
const demoPool = require("../models/demoPool")

function selectPool(req, res, next) {
	if (req.user !== undefined && req.user.username !== "demo") {
		req.pool = pool;
	} else {
		req.pool = demoPool;
	}

	next();
}

module.exports = selectPool;
