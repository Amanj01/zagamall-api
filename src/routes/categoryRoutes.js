const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllCategories,
  getCategoryById, 
  createCategory, 
  updateCategory 
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", paginationMiddleware("category"));
router.get("/all", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteRecordMiddleware("category"));

module.exports = router;
