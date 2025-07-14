const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const { 
  getAllBrands,
  getBrandById, 
  createBrand, 
  updateBrand,
  deleteBrand
} = require("../controllers/brandController");

const router = express.Router();

router.get("/", getAllBrands);
router.get("/:id", getBrandById);
router.post("/", protect, createBrand);
router.put("/:id", protect, updateBrand);
router.delete("/:id", protect, deleteBrand);

module.exports = router;
