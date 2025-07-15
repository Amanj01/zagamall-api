const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

// Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } }
      ];
    }

    const totalCount = await prisma.teamMember.count({ where });
    const teamMembers = await prisma.teamMember.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: { positionRef: true },
    });

    const meta = {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      pageSize,
    };

    res.status(200).json({
      success: true,
      message: "Team members retrieved successfully",
      data: teamMembers,
      meta
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch team members", error: error.message });
  }
};

// Get a specific team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMemberId = parseInt(id);
    if (isNaN(teamMemberId)) {
      return res.status(400).json({ success: false, message: "Invalid team member ID" });
    }
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { positionRef: true },
    });
    if (!teamMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }
    res.status(200).json({ success: true, message: "Team member retrieved successfully", data: teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch team member", error: error.message });
  }
};

// Create a new team member
const createTeamMember = async (req, res) => {
  try {
    const { name, positionId, email, phone, bio, imagePath } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!positionId) {
      return res.status(400).json({ success: false, message: "Position is required" });
    }
    if (!imagePath) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    
    const teamMember = await prisma.teamMember.create({
      data: {
        name,
        positionId: parseInt(positionId),
        email,
        phone,
        bio,
        imagePath,
      },
      include: { positionRef: true },
    });
    res.status(201).json({ success: true, message: "Team member created successfully", data: teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create team member", error: error.message });
  }
};

// Update a team member
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMemberId = parseInt(id);
    const { name, positionId, email, phone, bio, imagePath } = req.body;
    if (isNaN(teamMemberId)) {
      return res.status(400).json({ success: false, message: "Invalid team member ID" });
    }
    const existingTeamMember = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
    if (!existingTeamMember) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }
    
    // Handle image update
    let finalImagePath = existingTeamMember.imagePath;
    if (imagePath && imagePath !== existingTeamMember.imagePath) {
      // Delete old image from Cloudinary if it exists and is different
      if (existingTeamMember.imagePath) {
        await deleteCloudinaryImage(existingTeamMember.imagePath);
      }
      finalImagePath = imagePath;
    }
    
    const updatedTeamMember = await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: {
        name: name || existingTeamMember.name,
        positionId: positionId ? parseInt(positionId) : existingTeamMember.positionId,
        email: email || existingTeamMember.email,
        phone: phone || existingTeamMember.phone,
        bio: bio || existingTeamMember.bio,
        imagePath: finalImagePath,
      },
      include: { positionRef: true },
    });
    res.status(200).json({ success: true, message: "Team member updated successfully", data: updatedTeamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update team member", error: error.message });
  }
};

// Delete a team member
const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMemberId = parseInt(id);
    if (isNaN(teamMemberId)) {
      return res.status(400).json({ success: false, message: "Invalid team member ID" });
    }
    const existingTeamMember = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
    if (!existingTeamMember) {
      return res.status(200).json({ success: true, message: "Team member already deleted", data: null });
    }
    if (existingTeamMember.imagePath) {
      try {
        await deleteCloudinaryImage(existingTeamMember.imagePath);
      } catch (deleteError) {
        // Continue with deletion even if image deletion fails
      }
    }
    await prisma.teamMember.delete({ where: { id: teamMemberId } });
    res.status(200).json({ success: true, message: "Team member deleted successfully", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete team member", error: error.message });
  }
};

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
