const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const User = require("../models/User");
const axios = require("axios");
const { emailLoggerFn } = require("../modules/logging");

passport.use(
  "fenix",
  new OAuth2Strategy(
    {
      authorizationURL: "https://fenix.tecnico.ulisboa.pt/oauth/userdialog",
      tokenURL: "https://fenix.tecnico.ulisboa.pt/oauth/access_token",
      clientID: process.env.FENIX_CLIENT_ID,
      clientSecret: process.env.FENIX_CLIENT_SECRET,
      callbackURL: `${process.env.API_ADDRESS}/auth/fenix/callback`,
      scope: ["Informação"],
    },
    function (accessToken, refreshToken, profile, cb) {
      axios
        .get("https://fenix.tecnico.ulisboa.pt/api/fenix/v1/person", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(async (response) => {
          let { username, name, photo, email } = response.data;

          const fullName = name.split(" ");
          name = `${fullName[0]} ${fullName[fullName.length - 1]}`;
          photo = photo.data;

          const user = await User.getOne(require("../models/pool"), username);
          if (user) {
            const updatedUser = await User.updateOne(
              require("../models/pool"),
              username,
              true,
              name,
              photo,
              email,
            );

            if (!user.active) {
              delete user.photo;
              delete updatedUser.photo;
              emailLoggerFn(name, "User", "PUT", user, updatedUser);
            }
          }

          cb(null, { username, name, photo, email });
        })
        .catch((error) => {
          cb(error, null);
        });
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
