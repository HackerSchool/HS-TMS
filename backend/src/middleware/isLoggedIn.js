function isLoggedIn(req, res, next) {
	req.isAuthenticated() ? next() : res.sendStatus(401);
}

module.exports = isLoggedIn;
