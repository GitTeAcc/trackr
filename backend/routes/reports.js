const express = require("express");
const { getMonthlySummary, getSpendingTrend } = require("../handlers/reports");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/summary", getMonthlySummary);
router.get("/trend", getSpendingTrend);

module.exports = router;
