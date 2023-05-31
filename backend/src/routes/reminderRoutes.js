const express = require("express");
const reminderController = require("../controllers/reminderController");

const router = express.Router();

router.get("/", reminderController.getAllReminders);
router.get("/:id", reminderController.getReminder);
router.post("/", reminderController.createReminder);
router.put("/:id", reminderController.updateReminder);
router.delete("/:id", reminderController.deleteReminder);

module.exports = router;
