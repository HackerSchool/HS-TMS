function isLoggedIn(req, res, next) {
    req.user ? (req.user.username !== "forbidden" ? next() : res.sendStatus(403)) : res.sendStatus(401);
}

module.exports = isLoggedIn;
