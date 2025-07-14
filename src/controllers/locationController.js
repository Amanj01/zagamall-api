const prisma = require("../prisma");

// Get all locations with pagination, search, and meta
const getAllLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "id",
      sortOrder = "desc",
      type = ""
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search and filtering
    const whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { locationByDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Only set type if it's a valid enum value
    const validTypes = ['STORE', 'OFFICE', 'ENTERTAINMENT', 'DINING'];
    if (type && validTypes.includes(type.toUpperCase())) {
      whereClause.type = type.toUpperCase();
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.location.count({
      where: whereClause
    });

    // Get locations with pagination
    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize
      // Removed include for performance
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
      self: `${baseUrl}?page=${pageNumber}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}`,
      first: `${baseUrl}?page=1&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}`,
      last: `${baseUrl}?page=${totalPages}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}`,
      next: hasNextPage ? `${baseUrl}?page=${pageNumber + 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}` : null,
      prev: hasPreviousPage ? `${baseUrl}?page=${pageNumber - 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&type=${type}` : null
    };

    res.status(200).json({
      success: true,
      message: "Locations retrieved successfully",
      data: locations,
      meta,
      links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
      error: error.message
    });
  }
};

// Get single location by ID
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID"
      });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        stores: true,
        offices: true,
        entertainmentAndSports: true,
        dinings: true
      }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Location retrieved successfully",
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch location",
      error: error.message
    });
  }
};

// Create new location
const createLocation = async (req, res) => {
  try {
    const { level, placeNumber, number, type, locationByDescription } = req.body;

    // Validation
    if (!level || level < 1) {
      return res.status(400).json({
        success: false,
        message: "Level is required and must be at least 1"
      });
    }

    // Accept either placeNumber or number for backward compatibility
    const locationNumber = number !== undefined ? number : placeNumber;
    if (!locationNumber || locationNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Number is required and must be at least 1"
      });
    }

    // Validate integer ranges for 32-bit signed integers
    const levelValue = parseInt(level);
    const numberValue = parseInt(locationNumber);

    if (isNaN(levelValue) || levelValue < -2147483648 || levelValue > 2147483647) {
      return res.status(400).json({
        success: false,
        message: "Level must be a valid integer between -2147483648 and 2147483647"
      });
    }

    if (isNaN(numberValue) || numberValue < -2147483648 || numberValue > 2147483647) {
      return res.status(400).json({
        success: false,
        message: "Number must be a valid integer between -2147483648 and 2147483647"
      });
    }

    if (!type || !['STORE', 'OFFICE', 'ENTERTAINMENT', 'DINING'].includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Type is required and must be one of: STORE, OFFICE, ENTERTAINMENT, DINING"
      });
    }

    if (locationByDescription && locationByDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters"
      });
    }

    // Check if location with same level, number, and type already exists
    const existingLocation = await prisma.location.findFirst({
      where: {
        level: levelValue,
        number: numberValue,
        type: type.toUpperCase()
      }
    });

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        message: `A ${type.toLowerCase()} location with level ${levelValue} and number ${numberValue} already exists`
      });
    }

    const location = await prisma.location.create({
      data: {
        level: levelValue,
        number: numberValue,
        type: type.toUpperCase(),
        locationByDescription: locationByDescription ? locationByDescription.trim() : null
      },
      include: {
        stores: true,
        offices: true,
        entertainmentAndSports: true,
        dinings: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A location with these specifications already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create location",
      error: error.message
    });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);
    const { level, placeNumber, number, type, locationByDescription } = req.body;

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID"
      });
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    // Validation
    if (level !== undefined && (level < 1 || isNaN(level))) {
      return res.status(400).json({
        success: false,
        message: "Level must be at least 1"
      });
    }

    // Accept either placeNumber or number for backward compatibility
    const locationNumber = number !== undefined ? number : placeNumber;
    if (locationNumber !== undefined && (locationNumber < 1 || isNaN(locationNumber))) {
      return res.status(400).json({
        success: false,
        message: "Number must be at least 1"
      });
    }

    if (type && !['STORE', 'OFFICE', 'ENTERTAINMENT', 'DINING'].includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Type must be one of: STORE, OFFICE, ENTERTAINMENT, DINING"
      });
    }

    if (locationByDescription && locationByDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 500 characters"
      });
    }

    // Check if the new combination already exists (excluding current location)
    if (level !== undefined || locationNumber !== undefined || type !== undefined) {
      const newLevel = level !== undefined ? parseInt(level) : existingLocation.level;
      const newNumber = locationNumber !== undefined ? parseInt(locationNumber) : existingLocation.number;
      const newType = type !== undefined ? type.toUpperCase() : existingLocation.type;

      // Validate integer ranges for 32-bit signed integers
      if (newLevel !== undefined && (isNaN(newLevel) || newLevel < -2147483648 || newLevel > 2147483647)) {
        return res.status(400).json({
          success: false,
          message: "Level must be a valid integer between -2147483648 and 2147483647"
        });
      }

      if (newNumber !== undefined && (isNaN(newNumber) || newNumber < -2147483648 || newNumber > 2147483647)) {
        return res.status(400).json({
          success: false,
          message: "Number must be a valid integer between -2147483648 and 2147483647"
        });
      }

      const conflictingLocation = await prisma.location.findFirst({
        where: {
          level: newLevel,
          number: newNumber,
          type: newType,
          id: { not: locationId }
        }
      });

      if (conflictingLocation) {
        return res.status(409).json({
          success: false,
          message: `A ${newType.toLowerCase()} location with level ${newLevel} and number ${newNumber} already exists`
        });
      }
    }

    // Validate integer ranges for 32-bit signed integers before update
    if (level !== undefined) {
      const levelValue = parseInt(level);
      if (isNaN(levelValue) || levelValue < -2147483648 || levelValue > 2147483647) {
        return res.status(400).json({
          success: false,
          message: "Level must be a valid integer between -2147483648 and 2147483647"
        });
      }
    }

    if (locationNumber !== undefined) {
      const numberValue = parseInt(locationNumber);
      if (isNaN(numberValue) || numberValue < -2147483648 || numberValue > 2147483647) {
        return res.status(400).json({
          success: false,
          message: "Number must be a valid integer between -2147483648 and 2147483647"
        });
      }
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        level: level !== undefined ? parseInt(level) : undefined,
        number: locationNumber !== undefined ? parseInt(locationNumber) : undefined,
        type: type !== undefined ? type.toUpperCase() : undefined,
        locationByDescription: locationByDescription !== undefined ? (locationByDescription ? locationByDescription.trim() : null) : undefined
      },
      include: {
        stores: true,
        offices: true,
        entertainmentAndSports: true,
        dinings: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: updatedLocation
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A location with these specifications already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message
    });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID"
      });
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        stores: true,
        offices: true,
        entertainmentAndSports: true,
        dinings: true
      }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }

    // Check if location is being used by any related entities
    const hasRelatedEntities = 
      existingLocation.stores.length > 0 ||
      existingLocation.offices.length > 0 ||
      existingLocation.entertainmentAndSports.length > 0 ||
      existingLocation.dinings.length > 0;

    if (hasRelatedEntities) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete location. It is being used by stores, offices, entertainment venues, or dining establishments.",
        relatedEntities: {
          stores: existingLocation.stores.length,
          offices: existingLocation.offices.length,
          entertainmentAndSports: existingLocation.entertainmentAndSports.length,
          dinings: existingLocation.dinings.length
        }
      });
    }

    await prisma.location.delete({
      where: { id: locationId }
    });

    res.status(200).json({
      success: true,
      message: "Location deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
      error: error.message
    });
  }
};

// Get locations by type
const getLocationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    if (!['STORE', 'OFFICE', 'ENTERTAINMENT', 'DINING'].includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid location type. Must be one of: STORE, OFFICE, ENTERTAINMENT, DINING"
      });
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const whereClause = { type: type.toUpperCase() };
    
    if (search) {
      whereClause.OR = [
        { locationByDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const totalCount = await prisma.location.count({
      where: whereClause
    });

    // Get locations
    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
      skip: skip,
      take: pageSize,
      include: {
        stores: true,
        offices: true,
        entertainmentAndSports: true,
        dinings: true
      }
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

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

    res.status(200).json({
      success: true,
      message: `${type.charAt(0) + type.slice(1).toLowerCase()} locations retrieved successfully`,
      data: locations,
      meta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations by type",
      error: error.message
    });
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsByType
};
