function convertBodyToJSON(req, res, next) {
	if (req.body) {
		for (const field in req.body) {
			try {
				req.body[field] = JSON.parse(req.body[field]);
			} catch (error) {}
		}
	}

	next();
}

module.exports = convertBodyToJSON;
