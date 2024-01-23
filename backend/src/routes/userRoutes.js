const express = require("express");
const userController = require("../controllers/userController");
const { asyncHandler } = require("../middleware/error");
const { demoUserNonGETRestriction } = require("../middleware/demoUserRestriction");

const router = express.Router();
router.use(demoUserNonGETRestriction);

router.get("/", asyncHandler(userController.getAllUsers));
router.post("/", asyncHandler(userController.createUser));
router.delete("/:username", asyncHandler(userController.deleteUser));

module.exports = router;
