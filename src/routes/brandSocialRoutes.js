const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const {
  getBrandSocials,
  createBrandSocial,
  updateBrandSocial,
  deleteBrandSocial,
} = require("../controllers/brandSocialController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  paginationMiddleware("brandSocial", [], {
    include: { brand: true },
  })
);
router.get(
  "/:brandId/socials",
  paginationMiddleware("brandSocial", ["brandId"])
);

router.post("/", upload.single("icon"), protect, createBrandSocial);

router.put("/:socialId", upload.single("icon"), protect, updateBrandSocial);

router.delete("/:socialId", protect, deleteBrandSocial);

module.exports = router;
