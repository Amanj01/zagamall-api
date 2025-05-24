const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  me,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

// Register a new user (only admins can create new users)
router.post("/register", upload.none(), protect, registerUser);

router.post("/login", upload.none(), loginUser);

router.get(
  "/",
  protect,
  paginationMiddleware("user", [], {
    include: { role: true },
    omit: { password: true, updatedAt: true },
  })
);

router.get("/auth/me", protect, me);

router.get("/:id", protect, getUserById);

router.put("/:id", upload.none(), protect, updateUser);

router.delete("/:id", protect, deleteRecordMiddleware("user"));

module.exports = router;
