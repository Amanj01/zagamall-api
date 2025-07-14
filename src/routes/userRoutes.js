const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  me,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

// Register a new user (only super_admin can create new users)
router.post("/register", upload.none(), protect, requireRole(["super_admin"]), registerUser);

// Login
router.post("/login", upload.none(), loginUser);

// Get all users (admin/super_admin only)
router.get(
  "/",
  protect,
  requireRole(["admin", "super_admin"]),
  paginationMiddleware("user", [], {
    include: { role: true },
    omit: { password: true, updatedAt: true },
  })
);

// Get current user info (all roles)
router.get("/auth/me", protect, me);

// Get a specific user by ID (admin/super_admin only)
router.get("/:id", protect, requireRole(["admin", "super_admin"]), getUserById);

// Update user (admin/super_admin only, but only super_admin can update roles)
router.put(
  "/:id",
  upload.none(),
  protect,
  requireRole(["admin", "super_admin"]),
  updateUser
);

module.exports = router;
