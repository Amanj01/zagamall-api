const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require("../../controllers/brandController");
const router = express.Router();

router.get("/", getAllBrands);
router.get("/:id", protect, getBrandById);
router.post("/", protect, createBrand);
router.put("/:id", protect, updateBrand);
router.delete("/:id", protect, deleteBrand);

module.exports = router;