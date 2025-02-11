const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  getBrandResources,
  createBrandResources,
  deleteBrandResource,
} = require("../controllers/brandResourceController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  paginationMiddleware("brandResource", [], {
    include: { brand: true },
  })
);
router.get(
  "/:brandId/resources",
  paginationMiddleware("brandResource", ["brandId"])
);

router.post(
  "/",
  upload.array("resourceFile", 10),
  protect,
  createBrandResources
);

router.delete("/:resourceId", protect, deleteBrandResource);

module.exports = router;
