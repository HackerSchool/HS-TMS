function demoUserRestriction(req, res, next) {
  if (req.user !== undefined && req.user.username === "demo") {
    res.status(403).json({ username: "demo" }).send();
  } else {
    next();
  }
}

function demoUserNonGETRestriction(req, res, next) {
  if (req.user !== undefined && req.user.username === "demo") {
    if (req.method === "GET") {
      next();
    } else {
      res.status(403).json({ username: "demo" }).send();
    }
  } else {
    next();
  }
}

module.exports = { demoUserRestriction, demoUserNonGETRestriction };
