function demoUserRestriction(req, res, next) {
	if (req.user !== undefined && req.user.username === "demo") {
		if (req.method === "GET") {
			next();
		} else {
			res.sendStatus(403);
		}
	} else {
		next();
	}
}

module.exports = demoUserRestriction;
