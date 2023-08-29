const express = require("express");
const userController = require("../controllers/userController");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:username", asyncHandler(userController.getUser));
router.post("/", asyncHandler(userController.createUser));
router.put("/:username", asyncHandler(userController.updateUser));
router.delete("/:username", asyncHandler(userController.deleteUser));

module.exports = router;
