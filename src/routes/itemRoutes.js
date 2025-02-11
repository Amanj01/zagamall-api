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

router.get("/", paginationMiddleware("item"));

router.get("/:brandId/items", paginationMiddleware("item", ["brandId"]));

router.get("/:itemId", getItemById);

router.post("/", upload.single("cardImage"), protect, createItem);

router.put("/:itemId", upload.single("cardImage"), protect, updateItem);

router.delete("/:itemId", protect, deleteItem);

module.exports = router;
