const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const User = require("../models/User");
const axios = require("axios");
require("dotenv").config();

passport.use(
	"fenix",
	new OAuth2Strategy(
		{
			authorizationURL: "https://fenix.tecnico.ulisboa.pt/oauth/userdialog",
			tokenURL: "https://fenix.tecnico.ulisboa.pt/oauth/access_token",
			clientID: process.env.FENIX_CLIENT_ID,
			clientSecret: process.env.FENIX_CLIENT_SECRET,
			callbackURL: `http://localhost:${process.env.PORT}/auth/fenix/callback`,
			scope: ["Informação"]
		},
		function (accessToken, refreshToken, profile, cb) {
			axios
				.get("https://fenix.tecnico.ulisboa.pt/api/fenix/v1/person", {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				})
				.then(async (response) => {
					let { username, name, photo } = response.data;

					if (
						!(await User.getOne(
							require("../middleware/selectPool").pool,
							username
						))
					) {
						username = "forbidden";
					} else {
						const fullName = name.split(" ");
						name = `${fullName[0]} ${fullName[fullName.length - 1]}`;
						photo = photo.data;

						await User.updateOne(
							require("../middleware/selectPool").pool,
							username,
							true,
							name,
							photo
						);
					}

					cb(null, { username, name, photo });
				})
				.catch((error) => {
					cb(error, null);
				});
		}
	)
);

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});
