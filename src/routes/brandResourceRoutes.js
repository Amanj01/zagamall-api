const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  createBrandResources,
} = require("../controllers/brandResourceController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

router.get(
  "/",
  paginationMiddleware("brandResource", [], {
    include: { brand: true },
  })
);
router.get(
  "/:brandId/resources",
  paginationMiddleware("brandResource", ["brandId"])
);

router.post("/", upload.single("resourceFile"), protect, createBrandResources);

router.delete("/:id", protect, deleteRecordMiddleware("brandResource"));

module.exports = router;
