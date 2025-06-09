const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllStores,
  getStoreById, 
  createStore, 
  updateStore 
} = require("../controllers/storeController");

const router = express.Router();

router.get("/", paginationMiddleware("store", ["category", "location", "isShowInHome"], { include: { category: true, location: true } }));
router.get("/all", getAllStores);
router.get("/:id", getStoreById);
router.post("/", upload.single("image"), protect, createStore);
router.put("/:id", upload.single("image"), protect, updateStore);
router.delete("/:id", protect, deleteRecordMiddleware("store"));

module.exports = router;
