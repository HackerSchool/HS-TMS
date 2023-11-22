const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();

passport.use(
	"demo",
	new LocalStrategy(function (username, password, done) {
		if (username === "demo" && password === "demo") {
			done(null, { username });
		} else {
			done(null, null);
		}
	})
);

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});
