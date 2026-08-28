const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

async function getBudgets(req, res) {
  const { month, year } = req.query;
  const now = new Date();
  const m = Number(month) || now.getMonth() + 1;
  const y = Number(year) || now.getFullYear();

  const budgets = await Budget.find({ userId: req.user._id, month: m, year: y });

  const enriched = await Promise.all(
    budgets.map(async (budget) => {
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);

      const result = await Transaction.aggregate([
        {
          $match: {
            userId: req.user._id,
            category: budget.category,
            type: "expense",
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = result[0]?.total || 0;
      return { ...budget.toObject(), spent };
    })
  );

  res.json(enriched);
}

async function setBudget(req, res) {
  const { category, limit, month, year } = req.body;

  if (!category || !limit) {
    return res.status(400).json({ message: "Category and limit are required" });
  }

  const now = new Date();
  const m = Number(month) || now.getMonth() + 1;
  const y = Number(year) || now.getFullYear();

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user._id, category, month: m, year: y },
    { limit },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(budget);
}

async function deleteBudget(req, res) {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }

  res.json({ message: "Budget removed" });
}

module.exports = { getBudgets, setBudget, deleteBudget };
