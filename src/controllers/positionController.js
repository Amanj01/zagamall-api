const prisma = require("../prisma");

// Get all positions with pagination, search, and meta
const getPositions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "name",
      sortOrder = "asc"
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.position.count({
      where: whereClause
    });

    // Get positions with pagination
    const positions = await prisma.position.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    // Build meta information
    const meta = {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      pageSize,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      previousPage: hasPreviousPage ? pageNumber - 1 : null
    };

    // Build links for HATEOAS
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const links = {
      self: `${baseUrl}?page=${pageNumber}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      first: `${baseUrl}?page=1&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      last: `${baseUrl}?page=${totalPages}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      next: hasNextPage ? `${baseUrl}?page=${pageNumber + 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}` : null,
      prev: hasPreviousPage ? `${baseUrl}?page=${pageNumber - 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}` : null
    };

    res.status(200).json({
      success: true,
      message: "Positions retrieved successfully",
      data: positions,
      meta,
      links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch positions",
      error: error.message
    });
  }
};

// Get single position by ID
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const positionId = parseInt(id);

    if (isNaN(positionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid position ID"
      });
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Position retrieved successfully",
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch position",
      error: error.message
    });
  }
};

// Create new position
const createPosition = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name is required and cannot be empty"
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 255 characters"
      });
    }

    // Check if name already exists
    const existingPosition = await prisma.position.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } }
    });

    if (existingPosition) {
      return res.status(409).json({
        success: false,
        message: "A position with this name already exists"
      });
    }

    const position = await prisma.position.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: position
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A position with this name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create position",
      error: error.message
    });
  }
};

// Update position
const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const positionId = parseInt(id);
    const { name } = req.body;

    if (isNaN(positionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid position ID"
      });
    }

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!existingPosition) {
      return res.status(404).json({
        success: false,
        message: "Position not found"
      });
    }

    // Validation
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Name is required and cannot be empty"
      });
    }

    if (name && name.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 255 characters"
      });
    }



    // Check if name already exists (excluding current position)
    if (name && name.trim() !== existingPosition.name) {
      const existingPositionWithName = await prisma.position.findFirst({
        where: { 
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: positionId }
        }
      });

      if (existingPositionWithName) {
        return res.status(409).json({
          success: false,
          message: "A position with this name already exists"
        });
      }
    }

    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: {
        name: name ? name.trim() : existingPosition.name
      }
    });

    res.status(200).json({
      success: true,
      message: "Position updated successfully",
      data: updatedPosition
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A position with this name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update position",
      error: error.message
    });
  }
};

// Delete position
const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const positionId = parseInt(id);

    if (isNaN(positionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid position ID"
      });
    }

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id: positionId }
    });

    if (!existingPosition) {
      return res.status(404).json({
        success: false,
        message: "Position not found"
      });
    }

    // Check if position is being used by any team members
    const teamMembersUsingPosition = await prisma.teamMember.findFirst({
      where: { positionId: positionId }
    });

    if (teamMembersUsingPosition) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete position. It is being used by team members."
      });
    }

    await prisma.position.delete({
      where: { id: positionId }
    });

    res.status(200).json({
      success: true,
      message: "Position deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete position",
      error: error.message
    });
  }
};

// Get all positions (for dropdowns)
const getActivePositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Positions retrieved successfully",
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active positions",
      error: error.message
    });
  }
};

module.exports = {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  getActivePositions
}; 