const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { 
  getAllTeamMembers,
  getTeamMemberById, 
  createTeamMember, 
  updateTeamMember,
  deleteTeamMember
} = require("../controllers/teamMemberController");

const router = express.Router();

router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);
router.post("/", protect, createTeamMember);
router.put("/:id", protect, updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
