const express = require("express");
const reminderController = require("../controllers/reminderController");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

router.get("/", asyncHandler(reminderController.getAllReminders));
router.get("/:id", asyncHandler(reminderController.getReminder));
router.post("/", asyncHandler(reminderController.createReminder));
router.put("/:id", asyncHandler(reminderController.updateReminder));
router.delete("/:id", asyncHandler(reminderController.deleteReminder));

module.exports = router;
