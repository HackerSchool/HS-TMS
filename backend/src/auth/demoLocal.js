const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  "demo",
  new LocalStrategy(function (username, password, done) {
    if (username === "demo" && password === "demo") {
      const name = "Demo User";
      done(null, { username, name });
    } else {
      done(null, null);
    }
  }),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
