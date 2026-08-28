const Transaction = require("../models/Transaction");

async function getMonthlySummary(req, res) {
  const { month, year } = req.query;
  const now = new Date();
  const m = Number(month) || now.getMonth() + 1;
  const y = Number(year) || now.getFullYear();

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const summary = await Transaction.aggregate([
    { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byCategory = await Transaction.aggregate([
    { $match: { userId: req.user._id, type: "expense", date: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  let income = 0, expense = 0, incomeCount = 0, expenseCount = 0;
  summary.forEach((s) => {
    if (s._id === "income") { income = s.total; incomeCount = s.count; }
    if (s._id === "expense") { expense = s.total; expenseCount = s.count; }
  });

  res.json({
    month: m,
    year: y,
    income,
    expense,
    balance: income - expense,
    incomeCount,
    expenseCount,
    byCategory,
  });
}

async function getSpendingTrend(req, res) {
  const { months = 6 } = req.query;
  const count = Math.min(Number(months), 12);

  const now = new Date();
  const results = [];

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const summary = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let income = 0, expense = 0;
    summary.forEach((s) => {
      if (s._id === "income") income = s.total;
      if (s._id === "expense") expense = s.total;
    });

    results.push({
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      label: start.toLocaleString("default", { month: "short", year: "numeric" }),
      income,
      expense,
    });
  }

  res.json(results);
}

module.exports = { getMonthlySummary, getSpendingTrend };
