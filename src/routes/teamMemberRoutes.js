const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllTeamMembers,
  getTeamMemberById, 
  createTeamMember, 
  updateTeamMember 
} = require("../controllers/teamMemberController");

const router = express.Router();

router.get("/", paginationMiddleware("teamMember"));
router.get("/all", getAllTeamMembers);
router.get("/:id", getTeamMemberById);
router.post("/", upload.single("image"), protect, createTeamMember);
router.put("/:id", upload.single("image"), protect, updateTeamMember);
router.delete("/:id", protect, deleteRecordMiddleware("teamMember"));

module.exports = router;
