const express = require("express");
const projectController = require("../controllers/projectController");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

router.get("/", asyncHandler(projectController.getAllProjects));
router.get("/:id", asyncHandler(projectController.getProject));
router.post("/", asyncHandler(projectController.createProject));
router.put("/:id", asyncHandler(projectController.updateProject));
router.delete("/:id", asyncHandler(projectController.deleteProject));

module.exports = router;
