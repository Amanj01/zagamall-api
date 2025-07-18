const express = require("express");
const upload = require("../../middlewares/uploadMiddleware");
const { protect } = require("../../middlewares/authMiddleware");
const paginationMiddleware = require("../../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../../middlewares/deleteMiddleware");
const { 
  getAllDinings,
  getDiningById, 
  createDining, 
  updateDining,
  deleteDining
} = require("../../controllers/diningController");

const router = express.Router();

router.get("/", getAllDinings);
router.get("/:id", protect, getDiningById);
router.post("/", protect, upload.single('imagePath'), createDining);
router.put("/:id", protect, upload.single('imagePath'), updateDining);
router.delete("/:id", protect, deleteDining);

module.exports = router; 