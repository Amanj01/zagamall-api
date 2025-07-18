const express = require("express");
const { getItemById } = require("../../controllers/itemController");
const paginationMiddleware = require("../../middlewares/paginationMiddleware");
const router = express.Router();

router.get("/", paginationMiddleware("item", ["showOnHomepage"], { include: { brand: { select: { id: true, name: true } } } }));
router.get("/:brandId/items", paginationMiddleware("item", ["brandId"]));
router.get("/:itemId", getItemById);

module.exports = router; 