const prisma = require("../prisma");

// Get all parkings with pagination, search, and meta
const getAllParkings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.parking.count({ where: whereClause });

    // Get parkings with pagination
    const parkings = await prisma.parking.findMany({
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
      message: "Parkings retrieved successfully",
      data: parkings,
      meta,
      links
    });
  } catch (error) {
    console.error('Error in getAllParkings:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parkings",
      error: error.message
    });
  }
};

// Get single parking by ID
const getParkingById = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingId = parseInt(id);

    if (isNaN(parkingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking ID"
      });
    }

    const parking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: "Parking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Parking retrieved successfully",
      data: parking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch parking",
      error: error.message
    });
  }
};

// Create new parking
const createParking = async (req, res) => {
  try {
    const { title, description, image } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }
    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters"
      });
    }

    const parking = await prisma.parking.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        image: image || null
      }
    });

    res.status(201).json({
      success: true,
      message: "Parking created successfully",
      data: parking
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A parking with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create parking",
      error: error.message
    });
  }
};

// Update parking
const updateParking = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingId = parseInt(id);
    const { title, description, image } = req.body;

    if (isNaN(parkingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking ID"
      });
    }

    // Check if parking exists
    const existingParking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!existingParking) {
      return res.status(404).json({
        success: false,
        message: "Parking not found"
      });
    }

    const updatedParking = await prisma.parking.update({
      where: { id: parkingId },
      data: {
        title: title ? title.trim() : existingParking.title,
        description: description ? description.trim() : existingParking.description,
        image: image !== undefined ? image : existingParking.image
      }
    });

    res.status(200).json({
      success: true,
      message: "Parking updated successfully",
      data: updatedParking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update parking",
      error: error.message
    });
  }
};

// Delete parking
const deleteParking = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingId = parseInt(id);

    if (isNaN(parkingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parking ID"
      });
    }

    // Check if parking exists
    const existingParking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!existingParking) {
      return res.status(404).json({
        success: false,
        message: "Parking not found"
      });
    }

    await prisma.parking.delete({ where: { id: parkingId } });
    res.status(200).json({
      success: true,
      message: "Parking deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete parking",
      error: error.message
    });
  }
};

module.exports = {
  getAllParkings,
  getParkingById,
  createParking,
  updateParking,
  deleteParking,
}; 