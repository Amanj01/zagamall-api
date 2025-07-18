const express = require("express");
const { getAllTeamMembers, getTeamMemberById } = require("../../controllers/teamMemberController");
const router = express.Router();

router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);

module.exports = router; 