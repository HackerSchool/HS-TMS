const express = require("express");
const transactionController = require("../controllers/transactionController");
const { asyncHandler } = require("../middleware/error");

const router = express.Router();

router.get("/", asyncHandler(transactionController.getAllTransactions));
router.get("/:id", asyncHandler(transactionController.getTransaction));
router.post("/", asyncHandler(transactionController.createTransaction));
router.put("/:id", asyncHandler(transactionController.updateTransaction));
router.delete("/:id", asyncHandler(transactionController.deleteTransaction));

module.exports = router;
