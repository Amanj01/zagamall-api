const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

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
    const { name, position, bio, imagePath } = req.body;
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
    const { name, position, bio, imagePath } = req.body;
    const existingTeamMember = await prisma.teamMember.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTeamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    // Delete old Cloudinary image if imagePath is changing
    if (imagePath && imagePath !== existingTeamMember.imagePath && existingTeamMember.imagePath) {
      await deleteCloudinaryImage(existingTeamMember.imagePath);
    }
    const updatedTeamMember = await prisma.teamMember.update({
      where: { id: parseInt(id) },
      data: {
        name,
        position,
        bio,
        imagePath,
      },
    });
    res.status(200).json({ message: "Team member updated successfully", teamMember: updatedTeamMember });
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
