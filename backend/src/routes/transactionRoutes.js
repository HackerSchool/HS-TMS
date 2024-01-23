const express = require("express");
const transactionController = require("../controllers/transactionController");
const { asyncHandler } = require("../middleware/error");
const { demoUserNonGETRestriction } = require("../middleware/demoUserRestriction");

const router = express.Router();
router.use(demoUserNonGETRestriction);

router.get("/", asyncHandler(transactionController.getAllTransactions));
router.get("/report", asyncHandler(transactionController.generateReport));
router.get("/:id", asyncHandler(transactionController.getTransaction));
router.get("/download/:id", asyncHandler(transactionController.downloadReceipt));
router.post("/", asyncHandler(transactionController.createTransaction));
router.put("/:id", asyncHandler(transactionController.updateTransaction));
router.delete("/:id", asyncHandler(transactionController.deleteTransaction));

module.exports = router;
