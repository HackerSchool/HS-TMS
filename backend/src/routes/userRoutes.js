const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/:username", userController.getUser);
router.post("/", userController.createUser);
router.delete("/:username", userController.deleteUser);

module.exports = router;
