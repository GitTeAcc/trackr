const express = require("express");
const { getCategories, createCategory, deleteCategory } = require("../handlers/categories");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
