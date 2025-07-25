const express = require("express");
const upload = require("../../middlewares/uploadMiddleware");
const { protect } = require("../../middlewares/authMiddleware");
const paginationMiddleware = require("../../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../../middlewares/deleteMiddleware");
const { 
  getAllStores,
  getStoreById, 
  createStore, 
  updateStore 
} = require("../../controllers/storeController");

const router = express.Router();

router.get("/", getAllStores);
router.get("/:id", protect, getStoreById);
router.post("/", protect, createStore);
router.put("/:id", protect, updateStore);
router.delete("/:id", protect, deleteRecordMiddleware("store"));

module.exports = router; 