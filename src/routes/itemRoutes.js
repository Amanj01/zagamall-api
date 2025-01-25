const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/:brandId/items", paginationMiddleware("item", ["brandId"]));

router.get("/:brandId/items/:itemId", getItemById);

router.post("/:brandId/items", upload.single("cardImage"), protect, createItem);

router.put(
  "/:brandId/items/:itemId",
  upload.single("cardImage"),
  protect,
  updateItem
);

router.delete("/:brandId/items/:itemId", protect, deleteItem);

module.exports = router;
