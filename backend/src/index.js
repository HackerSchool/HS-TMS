const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./auth/OAuth2Strategy");
require("dotenv").config();
const isLoggedIn = require("./middleware/isLoggedin");

const app = express();

app.use(express.json());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(require("./middleware/selectPool").selectPool);

app.use("/projects", require("./routes/projectRoutes"));
app.use("/reminders", require("./routes/reminderRoutes"));
app.use("/transactions", require("./routes/transactionRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/auth", require("./routes/authRoutes"));

app.get("/health", async (req, res) => {
	res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
