const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllBrands,
  getBrandById, 
  createBrand, 
  updateBrand 
} = require("../controllers/brandController");

const router = express.Router();

router.get("/", paginationMiddleware("brand", ["isShowInHome"]));
router.get("/all", getAllBrands);
router.get("/:id", getBrandById);
router.post("/", upload.single("image"), protect, createBrand);
router.put("/:id", upload.single("image"), protect, updateBrand);
router.delete("/:id", protect, deleteRecordMiddleware("brand"));

module.exports = router;
