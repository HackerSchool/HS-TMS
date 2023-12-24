const express = require("express");
const userController = require("../controllers/userController");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();
router.use(require("../middleware/demoUserRestriction"));

router.get("/", asyncHandler(userController.getAllUsers));
router.post("/", asyncHandler(userController.createUser));
router.delete("/:username", asyncHandler(userController.deleteUser));

module.exports = router;
