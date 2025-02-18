const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const {
  getBrandById,
  createBrand,
  updateBrand,
} = require("../controllers/brandController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("brand"));
router.get("/:id", getBrandById);
router.post(
  "/",
  upload.fields([
    { name: "cardImage", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  protect,
  createBrand
);
router.put(
  "/:id",
  upload.fields([
    { name: "cardImage", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  protect,
  updateBrand
);
router.delete("/:id", protect, deleteRecordMiddleware("brand"));

module.exports = router;
