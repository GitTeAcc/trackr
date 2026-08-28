const express = require("express");
const { getTransactions, addTransaction, updateTransaction, deleteTransaction } = require("../handlers/transactions");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getTransactions);
router.post("/", addTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
