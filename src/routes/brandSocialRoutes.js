const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const {
  createBrandSocial,
  updateBrandSocial,
} = require("../controllers/brandSocialController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");

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

router.post("/", upload.single("coverMedia"), protect, createBrandSocial);

router.put("/:socialId", upload.single("icon"), protect, updateBrandSocial);

router.delete("/:id", protect, deleteRecordMiddleware("brandSocial"));

module.exports = router;
