const User = require("../models/User");

async function isLoggedIn(req, res, next) {
  try {
    if (req.user) {
      if (await User.getOne(require("../models/pool"), req.user.username)) {
        await User.updateOne(
          require("../models/pool"),
          req.user.username,
          true,
          req.user.name,
          req.user.photo,
          req.user.email,
        );

        next();
      } else if (req.user.username === "demo") {
        next();
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = isLoggedIn;
