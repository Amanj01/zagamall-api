const prisma = require("../prisma");
const { deleteFile, deleteCloudinaryImage } = require("../utils/utility");

// Get all hero sections with pagination, search, and meta
const getHeroSections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "orderNumber",
      sortOrder = "asc"
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
    const totalCount = await prisma.heroSection.count({
      where: whereClause
    });

    // Get hero sections with pagination
    const heroSections = await prisma.heroSection.findMany({
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
      message: "Hero sections retrieved successfully",
      data: heroSections,
      meta,
      links
    });
  } catch (error) {
    console.error('Error in getHeroSections:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hero sections",
      error: error.message
    });
  }
};

// Get single hero section by ID
const getHeroSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const heroSectionId = parseInt(id);

    if (isNaN(heroSectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero section ID"
      });
    }

    const heroSection = await prisma.heroSection.findUnique({
      where: { id: heroSectionId }
    });

    if (!heroSection) {
      return res.status(404).json({
        success: false,
        message: "Hero section not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Hero section retrieved successfully",
      data: heroSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hero section",
      error: error.message
    });
  }
};

// Create new hero section
const createHeroSection = async (req, res) => {
  try {
    const { title, description, orderNumber, imagePath } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required"
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

    const parsedOrderNumber = parseInt(orderNumber);
    if (isNaN(parsedOrderNumber) || parsedOrderNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Order number must be a positive integer"
      });
    }

    // Check if order number already exists
    const existingHeroWithOrder = await prisma.heroSection.findFirst({
      where: { orderNumber: parsedOrderNumber }
    });

    if (existingHeroWithOrder) {
      return res.status(409).json({
        success: false,
        message: `Order number ${parsedOrderNumber} is already taken. Please choose a different order number.`
      });
    }

    // Check if title already exists
    const existingHeroWithTitle = await prisma.heroSection.findFirst({
      where: { title: { equals: title.trim(), mode: 'insensitive' } }
    });

    if (existingHeroWithTitle) {
      return res.status(409).json({
        success: false,
        message: "A hero section with this title already exists"
      });
    }

    const heroSection = await prisma.heroSection.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        imagePath,
        orderNumber: parsedOrderNumber
      }
    });

    res.status(201).json({
      success: true,
      message: "Hero section created successfully",
      data: heroSection
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A hero section with this title or order number already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create hero section",
      error: error.message
    });
  }
};

// Update hero section
const updateHeroSection = async (req, res) => {
  try {
    const { id } = req.params;
    const heroSectionId = parseInt(id);
    const { title, description, orderNumber, imagePath } = req.body;

    if (isNaN(heroSectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero section ID"
      });
    }

    // Check if hero section exists
    const existingHeroSection = await prisma.heroSection.findUnique({
      where: { id: heroSectionId }
    });

    if (!existingHeroSection) {
      return res.status(404).json({
        success: false,
        message: "Hero section not found"
      });
    }

    // If imagePath is being updated and is different, delete the old Cloudinary image
    if (imagePath && imagePath !== existingHeroSection.imagePath && existingHeroSection.imagePath) {
      await deleteCloudinaryImage(existingHeroSection.imagePath);
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (orderNumber !== undefined) updateData.orderNumber = parseInt(orderNumber);
    if (imagePath !== undefined) updateData.imagePath = imagePath;

    const updatedHeroSection = await prisma.heroSection.update({
      where: { id: heroSectionId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: "Hero section updated successfully",
      data: updatedHeroSection
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A hero section with this title or order number already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update hero section",
      error: error.message
    });
  }
};

// Delete hero section
const deleteHeroSection = async (req, res) => {
  try {
    const { id } = req.params;
    const heroSectionId = parseInt(id);

    if (isNaN(heroSectionId)) {
      return res.status(400).json({ success: false, message: "Invalid hero section ID" });
    }

    // Fetch the hero section first (to get imagePath and check existence)
    const existingHeroSection = await prisma.heroSection.findUnique({
      where: { id: heroSectionId }
    });

    if (!existingHeroSection) {
      // If already deleted, return success (idempotent)
      return res.status(200).json({
        success: true,
        message: "Hero section already deleted",
        data: null
      });
    }

    // Delete the Cloudinary image if it exists
    if (existingHeroSection.imagePath) {
      await deleteCloudinaryImage(existingHeroSection.imagePath);
    }

    // Now delete from database
    try {
      await prisma.heroSection.delete({
        where: { id: heroSectionId }
      });
    } catch (error) {
      // Handle P2025 error (record not found)
      if (error.code === 'P2025') {
        // Record already deleted, treat as success (idempotent)
        return res.status(200).json({
          success: true,
          message: "Hero section already deleted",
          data: null
        });
      }
      // Other errors should be thrown to the outer catch
      throw error;
    }

    // Do not fetch the hero section after deletion
    return res.status(200).json({
      success: true,
      message: "Hero section deleted successfully",
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete hero section",
      error: error.message
    });
  }
};

const reorderHeroSections = async (req, res) => {
  try {
    const { heroSections } = req.body;

    if (!Array.isArray(heroSections) || heroSections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Hero sections array is required and cannot be empty"
      });
    }

    // Validate each hero section
    for (let i = 0; i < heroSections.length; i++) {
      const hero = heroSections[i];
      
      if (!hero || typeof hero.id !== 'number' || isNaN(hero.id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid hero section ID at index ${i}`
        });
      }

      // Check if hero section exists
      const existingHero = await prisma.heroSection.findUnique({
        where: { id: hero.id }
      });

      if (!existingHero) {
        return res.status(404).json({
          success: false,
          message: `Hero section with ID ${hero.id} not found`
        });
      }
    }

    // Check for duplicate IDs
    const heroIds = heroSections.map(hero => hero.id);
    const uniqueIds = new Set(heroIds);
    if (heroIds.length !== uniqueIds.size) {
      return res.status(400).json({
        success: false,
        message: "Duplicate hero section IDs found in the reorder request"
      });
    }

    // Update order numbers in transaction
    await prisma.$transaction(
      heroSections.map((hero, index) =>
        prisma.heroSection.update({
          where: { id: hero.id },
          data: { orderNumber: index + 1 } // Start from 1 instead of 0
        })
      )
    );

    // Get updated hero sections
    const updatedHeroSections = await prisma.heroSection.findMany({
      orderBy: { orderNumber: 'asc' }
    });

    res.status(200).json({
      success: true,
      message: "Hero sections reordered successfully",
      data: updatedHeroSections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder hero sections",
      error: error.message
    });
  }
};

// Get hero sections for homepage (public endpoint)
const getHomepageHeroSections = async (req, res) => {
  try {
    const heroSections = await prisma.heroSection.findMany({
      orderBy: { orderNumber: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        imagePath: true,
        orderNumber: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Homepage hero sections retrieved successfully",
      data: heroSections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage hero sections",
      error: error.message
    });
  }
};

module.exports = {
  getHeroSections,
  getHeroSectionById,
  createHeroSection,
  updateHeroSection,
  deleteHeroSection,
  reorderHeroSections,
  getHomepageHeroSections
}; 