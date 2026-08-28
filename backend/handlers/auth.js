const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Category = require("../models/Category");

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

const defaultCategories = [
  { name: "Food & Dining", icon: "🍔", color: "#e76f51", type: "expense" },
  { name: "Transport", icon: "🚗", color: "#457b9d", type: "expense" },
  { name: "Shopping", icon: "🛍️", color: "#e9c46a", type: "expense" },
  { name: "Entertainment", icon: "🎬", color: "#6d6875", type: "expense" },
  { name: "Health", icon: "💊", color: "#2a9d8f", type: "expense" },
  { name: "Utilities", icon: "💡", color: "#264653", type: "expense" },
  { name: "Rent", icon: "🏠", color: "#e63946", type: "expense" },
  { name: "Salary", icon: "💼", color: "#2d6a4f", type: "income" },
  { name: "Freelance", icon: "💻", color: "#40916c", type: "income" },
  { name: "Other", icon: "📦", color: "#adb5bd", type: "both" },
];

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const user = await User.create({ name, email, password });

  const seeded = defaultCategories.map((cat) => ({ ...cat, userId: user._id }));
  await Category.insertMany(seeded);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: makeToken(user._id),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    householdId: user.householdId,
    token: makeToken(user._id),
  });
}

async function getMe(req, res) {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
}

async function updateProfile(req, res) {
  const { name, email, avatar, currency } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (avatar !== undefined) user.avatar = avatar;
  if (currency) user.currency = currency;

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, currency: user.currency });
}

module.exports = { register, login, getMe, updateProfile };
