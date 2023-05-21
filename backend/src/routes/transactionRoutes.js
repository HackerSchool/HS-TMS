const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransaction);
router.post("/", transactionController.createTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
