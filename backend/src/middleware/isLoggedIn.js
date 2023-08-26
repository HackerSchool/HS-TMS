const User = require("../models/User");

async function isLoggedIn(req, res, next) {
	if (req.user) {
		if (
			await User.getOne(require("../middleware/selectPool").pool, req.user.username)
		) {
			next();
		} else {
			res.sendStatus(403);
		}
	} else {
		res.sendStatus(401);
	}
}

module.exports = isLoggedIn;
