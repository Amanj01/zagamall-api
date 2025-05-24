const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await prisma.teamMember.findMany();
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await prisma.teamMember.findUnique({
      where: { id: parseInt(id) },
    });

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json(teamMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new team member
const createTeamMember = async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        position,
        bio,
        imagePath,
      },
    });

    res.status(201).json({ message: "Team member created successfully", teamMember });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a team member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, bio } = req.body;

    const existingTeamMember = await prisma.teamMember.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : existingTeamMember.imagePath;

    const updatedTeamMember = await prisma.teamMember
      .update({
        where: { id: parseInt(id) },
        data: {
          name,
          position,
          bio,
          imagePath,
        },
      })
      .then((data) => {
        if (req.file && existingTeamMember.imagePath) {
          deleteFile(existingTeamMember.imagePath);
        }
        return data;
      });

    res.status(200).json({
      message: "Team member updated successfully",
      teamMember: updatedTeamMember,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
};
