const errorHandler = (err, req, res, next) => {
	if (!err) return next();

	console.error(err);
	res.sendStatus(500);
};

const asyncHandler = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch((err) => next(err));

module.exports = {
	asyncHandler,
	errorHandler
};
