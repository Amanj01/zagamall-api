const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  getBrandResources,
  createBrandResources,
  deleteBrandResource,
} = require("../controllers/brandResourceController");

const router = express.Router();

router.get("/:brandId/resources", getBrandResources);

router.post(
  "/:brandId/resources",
  upload.array("resourceFile", 10),
  protect,
  createBrandResources
);

router.delete("/:brandId/resources/:resourceId", protect, deleteBrandResource);

module.exports = router;
