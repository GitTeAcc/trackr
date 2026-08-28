const Household = require("../models/Household");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

async function createHousehold(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Household name is required" });
  }

  if (req.user.householdId) {
    return res.status(400).json({ message: "You are already in a household. Leave it first." });
  }

  const household = await Household.create({
    name,
    ownerId: req.user._id,
    members: [req.user._id],
  });

  await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

  res.status(201).json(household);
}

async function joinHousehold(req, res) {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({ message: "Invite code is required" });
  }

  if (req.user.householdId) {
    return res.status(400).json({ message: "You are already in a household. Leave it first." });
  }

  const household = await Household.findOne({ inviteCode: inviteCode.toUpperCase() });
  if (!household) {
    return res.status(404).json({ message: "No household found with that code" });
  }

  const alreadyMember = household.members.some((m) => m.toString() === req.user._id.toString());
  if (!alreadyMember) {
    household.members.push(req.user._id);
    await household.save();
  }

  await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

  res.json(household);
}

async function getMyHousehold(req, res) {
  if (!req.user.householdId) {
    return res.status(404).json({ message: "You are not in a household" });
  }

  const household = await Household.findById(req.user.householdId).populate("members", "name email avatar");

  if (!household) {
    return res.status(404).json({ message: "Household not found" });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const memberSummaries = await Promise.all(
    household.members.map(async (member) => {
      const summary = await Transaction.aggregate([
        {
          $match: {
            userId: member._id,
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]);

      let income = 0, expense = 0;
      summary.forEach((s) => {
        if (s._id === "income") income = s.total;
        if (s._id === "expense") expense = s.total;
      });

      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        income,
        expense,
        balance: income - expense,
      };
    })
  );

  const totals = memberSummaries.reduce(
    (acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense }),
    { income: 0, expense: 0 }
  );

  res.json({
    household: {
      _id: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
      ownerId: household.ownerId,
    },
    members: memberSummaries,
    totals: { ...totals, balance: totals.income - totals.expense },
  });
}

async function leaveHousehold(req, res) {
  if (!req.user.householdId) {
    return res.status(400).json({ message: "You are not in a household" });
  }

  const household = await Household.findById(req.user.householdId);

  if (!household) {
    return res.status(404).json({ message: "Household not found" });
  }

  if (household.ownerId.toString() === req.user._id.toString()) {
    await User.updateMany({ householdId: household._id }, { householdId: null });
    await household.deleteOne();
    return res.json({ message: "Household deleted since you were the owner" });
  }

  household.members = household.members.filter((m) => m.toString() !== req.user._id.toString());
  await household.save();
  await User.findByIdAndUpdate(req.user._id, { householdId: null });

  res.json({ message: "You left the household" });
}

module.exports = { createHousehold, joinHousehold, getMyHousehold, leaveHousehold };
