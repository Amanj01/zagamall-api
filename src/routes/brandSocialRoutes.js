const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const {
  createBrandSocial,
  updateBrandSocial,
  getBrandSocialById,
} = require("../controllers/brandSocialController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

router.get(
  "/",
  paginationMiddleware("brandSocial", [], {
    include: { brand: true },
  })
);

router.get("/:id", protect, getBrandSocialById);

router.post("/", upload.single("icon"), protect, createBrandSocial);

router.put("/:socialId", upload.single("icon"), protect, updateBrandSocial);

router.delete("/:id", protect, deleteRecordMiddleware("brandSocial"));

module.exports = router;
