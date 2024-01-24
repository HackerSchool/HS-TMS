const { logError } = require("../modules/logging");

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  res.sendStatus(500);
  logError("middleware/error", `${err}`);
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

module.exports = {
  asyncHandler,
  errorHandler,
};
