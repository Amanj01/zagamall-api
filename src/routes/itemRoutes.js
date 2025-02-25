const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getItemById,
  createItem,
  updateItem,
} = require("../controllers/itemController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");

const router = express.Router();

router.get(
  "/",
  paginationMiddleware("item", ["showOnHomePage"], {
    include: { brand: { select: { id: true, name: true } } },
  })
);

router.get("/:brandId/items", paginationMiddleware("item", ["brandId"]));

router.get("/:itemId", getItemById);

router.post("/", upload.single("cardImage"), protect, createItem);

router.put("/:itemId", upload.single("cardImage"), protect, updateItem);

router.delete("/:id", protect, deleteRecordMiddleware("item"));

module.exports = router;
