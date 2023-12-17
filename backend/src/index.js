const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const morgan = require("morgan");
require("./auth/fenixOAuth2");
require("./auth/demoLocal");
require("dotenv").config();
const isLoggedIn = require("./middleware/isLoggedIn");
const { logger } = require("./modules/logging/logger");

const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(
	cors({
		origin: process.env.CLIENT_ADDRESS,
		credentials: true
	})
);
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(require("./middleware/parseMultipartFormData"));
app.use(require("./middleware/selectPool"));
app.use(require("./middleware/error").errorHandler);
app.use(
	morgan(
		':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]',
		{
			stream: {
				write: (message) => logger.http(message.trim())
			}
		}
	)
);

app.use("/projects", isLoggedIn, require("./routes/projectRoutes"));
app.use("/reminders", isLoggedIn, require("./routes/reminderRoutes"));
app.use("/transactions", isLoggedIn, require("./routes/transactionRoutes"));
app.use("/users", isLoggedIn, require("./routes/userRoutes"));
app.use("/auth", require("./routes/authRoutes"));

app.get("/health", (req, res) => {
	res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
