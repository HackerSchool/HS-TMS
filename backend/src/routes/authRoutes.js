const express = require("express");
const passport = require("passport");
require("dotenv").config()
const { asyncHandler } = require("../middleware/error");
const isLoggedIn = require("../middleware/isLoggedIn");

const router = express.Router();

router.get("/fenix", asyncHandler(passport.authenticate("fenix")));

router.get(
	"/fenix/callback",
	asyncHandler(
		passport.authenticate("fenix", {
			successRedirect: "/auth/fenix/success",
			failureRedirect: "/auth/fenix/failure"
		})
	)
);

router.get("/fenix/success", (req, res) => {
	res.redirect(`${process.env.CLIENT_ADDRESS}/home`);
});

router.get("/fenix/failure", (req, res) => {
	res.redirect(`${process.env.CLIENT_ADDRESS}/login`);
});

router.get("/user", isLoggedIn, (req, res) => {
	res.send(req.user);
});

router.post("/logout", (req, res) => {
	req.logout(function (err) {
		req.session.destroy();
        res.status(200).send("Successfully logged out");
	});
});

module.exports = router;
