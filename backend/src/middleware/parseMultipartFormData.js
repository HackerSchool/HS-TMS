function parseMultipartFormData(req, res, next) {
	if (req.is("multipart/form-data") && req.body) {
		for (const field in req.body) {
			try {
				req.body[field] = JSON.parse(req.body[field]);
			} catch (error) {
				return res.status(400).send("Invalid JSON data in the request body.");
			}
		}
	}

	next();
}

module.exports = parseMultipartFormData;
