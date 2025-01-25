const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const {
  getBrandSocials,
  createBrandSocial,
  updateBrandSocial,
  deleteBrandSocial,
} = require("../controllers/brandSocialController");

const router = express.Router();

router.get("/:brandId/socials", getBrandSocials);

router.post(
  "/:brandId/socials",
  upload.single("icon"),
  protect,
  createBrandSocial
);

router.put(
  "/:brandId/socials/:socialId",
  upload.single("icon"),
  protect,
  updateBrandSocial
);

router.delete("/:brandId/socials/:socialId", protect, deleteBrandSocial);

module.exports = router;
