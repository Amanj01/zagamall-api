const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.post("/register", upload.none(), registerUser);

router.post("/login", upload.none(), loginUser);

router.get("/", protect, paginationMiddleware("user"));

router.get("/:id", protect, getUserById);

router.put("/:id", upload.none(), protect, updateUser);

router.delete("/:id", protect, deleteUser);

module.exports = router;
