const Transaction = require("../models/Transaction");

async function getTransactions(req, res) {
  const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;

  const filter = { userId: req.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
}

async function addTransaction(req, res) {
  const { type, amount, category, description, date, tags } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({ message: "Type, amount, and category are required" });
  }

  const transaction = await Transaction.create({
    userId: req.user._id,
    householdId: req.user.householdId || null,
    type,
    amount,
    category,
    description,
    date: date || Date.now(),
    tags,
  });

  res.status(201).json(transaction);
}

async function updateTransaction(req, res) {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const { type, amount, category, description, date, tags } = req.body;
  if (type) transaction.type = type;
  if (amount) transaction.amount = amount;
  if (category) transaction.category = category;
  if (description !== undefined) transaction.description = description;
  if (date) transaction.date = date;
  if (tags) transaction.tags = tags;

  await transaction.save();
  res.json(transaction);
}

async function deleteTransaction(req, res) {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json({ message: "Transaction deleted" });
}

module.exports = { getTransactions, addTransaction, updateTransaction, deleteTransaction };
