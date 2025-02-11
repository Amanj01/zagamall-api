const express = require("express");
const router = express.Router();
const {
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

// Routes
router.get("/", protect, paginationMiddleware("role"));
router.get("/:id", protect, getRoleById);
router.post("/", upload.none(), protect, createRole);
router.put("/:id", upload.none(), protect, updateRole);
router.delete("/:id", protect, deleteRole);

module.exports = router;
