const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/fenix", passport.authenticate("fenix"));

router.get(
	"/fenix/callback",
	passport.authenticate("fenix", {
		successRedirect: "/auth/fenix/success",
		failureRedirect: "/auth/fenix/failure"
	})
);

router.get("/fenix/success", (req, res) => {
	res.send("Authenticated");
});

router.get("/fenix/failure", (req, res) => {
	res.send("Failed to authenticate");
});

router.get("/user", (req, res) => {
	res.send(req.user);
});

router.post("/logout", (req, res) => {
	req.logout(function (err) {
		req.session.destroy();
		res.redirect("/");
	});
});

module.exports = router;
