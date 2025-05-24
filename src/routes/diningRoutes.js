const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllDinings,
  getDiningById, 
  createDining, 
  updateDining 
} = require("../controllers/diningController");

const router = express.Router();

router.get("/", paginationMiddleware("dining", ["category", "isShowInHome"]));
router.get("/all", getAllDinings);
router.get("/:id", getDiningById);
router.post("/", upload.single("image"), protect, createDining);
router.put("/:id", upload.single("image"), protect, updateDining);
router.delete("/:id", protect, deleteRecordMiddleware("dining"));

module.exports = router;
