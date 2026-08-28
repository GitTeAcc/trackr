const Category = require("../models/Category");

async function getCategories(req, res) {
  const categories = await Category.find({
    $or: [{ userId: req.user._id }, { userId: null, isDefault: true }],
  }).sort({ name: 1 });

  res.json(categories);
}

async function createCategory(req, res) {
  const { name, icon, color, type } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const existing = await Category.findOne({ name, userId: req.user._id });
  if (existing) {
    return res.status(400).json({ message: "You already have a category with that name" });
  }

  const category = await Category.create({
    userId: req.user._id,
    name,
    icon: icon || "📁",
    color: color || "#2d6a4f",
    type: type || "expense",
  });

  res.status(201).json(category);
}

async function deleteCategory(req, res) {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

  if (!category) {
    return res.status(404).json({ message: "Category not found or not yours to delete" });
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
}

module.exports = { getCategories, createCategory, deleteCategory };
