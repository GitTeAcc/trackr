const express = require("express");
const { getBudgets, setBudget, deleteBudget } = require("../handlers/budgets");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getBudgets);
router.post("/", setBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
