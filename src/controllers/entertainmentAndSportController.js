const prisma = require("../prisma");
const { deleteCloudinaryImage, uploadToCloudinary, deleteFile } = require("../utils/utility");

// Get all entertainment and sports with pagination, search, and meta
const getEntertainmentAndSports = async (req, res) => {
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
    const totalCount = await prisma.entertainmentAndSport.count({
      where: whereClause
    });

    // Get entertainment and sports with pagination
    const entertainmentAndSports = await prisma.entertainmentAndSport.findMany({
      where: whereClause,
      include: { location: true, EntertainmentAndSportGallery: true },
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
      message: "Entertainment and sports retrieved successfully",
      data: entertainmentAndSports,
      meta,
      links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch entertainment and sports",
      error: error.message
    });
  }
};

// Get single entertainment and sport by ID
const getEntertainmentAndSportById = async (req, res) => {
  try {
    const { id } = req.params;
    const entertainmentAndSportId = parseInt(id);

    if (isNaN(entertainmentAndSportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entertainment and sport ID"
      });
    }

    const entertainmentAndSport = await prisma.entertainmentAndSport.findUnique({
      where: { id: entertainmentAndSportId },
      include: { location: true, EntertainmentAndSportGallery: true }
    });

    if (!entertainmentAndSport) {
      return res.status(404).json({
        success: false,
        message: "Entertainment and sport not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Entertainment and sport retrieved successfully",
      data: entertainmentAndSport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch entertainment and sport",
      error: error.message
    });
  }
};

// Create new entertainment and sport
const createEntertainmentAndSport = async (req, res) => {
  try {
    const { title, description, locationId, area, category } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Description is required and cannot be empty"
      });
    }

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters"
      });
    }

    // Handle file uploads to Cloudinary
    let galleryImages = [];
    if (req.files && req.files.gallery) {
      try {
        const files = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
        
        for (const file of files) {
          console.log('📤 Uploading gallery image to Cloudinary...');
          const imageUrl = await uploadToCloudinary(file.buffer, 'entertainment-sports');
          console.log('✅ Gallery image uploaded to Cloudinary:', imageUrl);
          
          galleryImages.push({ imagePath: imageUrl });
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images to Cloudinary"
        });
      }
    }

    const entertainmentAndSport = await prisma.entertainmentAndSport.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        locationId: parseInt(locationId),
        area: area ? parseInt(area) : null,
        category: category || 'ENTERTAINMENT',
        EntertainmentAndSportGallery: { create: galleryImages }
      },
      include: { location: true, EntertainmentAndSportGallery: true }
    });

    res.status(201).json({
      success: true,
      message: "Entertainment and sport created successfully",
      data: entertainmentAndSport
    });
  } catch (error) {
    console.error('❌ Error creating entertainment and sport:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create entertainment and sport",
      error: error.message
    });
  }
};

// Update entertainment and sport
const updateEntertainmentAndSport = async (req, res) => {
  try {
    const { id } = req.params;
    const entertainmentAndSportId = parseInt(id);
    const { title, description, locationId, area, category } = req.body;

    if (isNaN(entertainmentAndSportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entertainment and sport ID"
      });
    }

    // Check if entertainment and sport exists
    const existingEntertainmentAndSport = await prisma.entertainmentAndSport.findUnique({
      where: { id: entertainmentAndSportId },
      include: { EntertainmentAndSportGallery: true }
    });

    if (!existingEntertainmentAndSport) {
      return res.status(404).json({
        success: false,
        message: "Entertainment and sport not found"
      });
    }

    // Handle file uploads to Cloudinary
    let galleryImages = [];
    if (req.files && req.files.gallery) {
      try {
        const files = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
        
        for (const file of files) {
          console.log('📤 Uploading new gallery image to Cloudinary...');
          const imageUrl = await uploadToCloudinary(file.buffer, 'entertainment-sports');
          console.log('✅ New gallery image uploaded to Cloudinary:', imageUrl);
          
          galleryImages.push({ imagePath: imageUrl });
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images to Cloudinary"
        });
      }
    }

    // Delete old gallery images from Cloudinary if new ones are uploaded
    if (galleryImages.length > 0) {
      for (const img of existingEntertainmentAndSport.EntertainmentAndSportGallery) {
        if (img.imagePath) {
          await deleteCloudinaryImage(img.imagePath);
        }
      }
      // Remove old gallery images from DB
      await prisma.entertainmentAndSportGallery.deleteMany({
        where: { entertainmentAndSportId: entertainmentAndSportId }
      });
    }

    const updatedEntertainmentAndSport = await prisma.entertainmentAndSport.update({
      where: { id: entertainmentAndSportId },
      data: {
        title: title ? title.trim() : existingEntertainmentAndSport.title,
        description: description ? description.trim() : existingEntertainmentAndSport.description,
        locationId: locationId ? parseInt(locationId) : existingEntertainmentAndSport.locationId,
        area: area ? parseInt(area) : existingEntertainmentAndSport.area,
        category: category || existingEntertainmentAndSport.category,
        ...(galleryImages.length > 0 && { EntertainmentAndSportGallery: { create: galleryImages } })
      },
      include: { location: true, EntertainmentAndSportGallery: true }
    });

    res.status(200).json({
      success: true,
      message: "Entertainment and sport updated successfully",
      data: updatedEntertainmentAndSport
    });
  } catch (error) {
    console.error('❌ Error updating entertainment and sport:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update entertainment and sport",
      error: error.message
    });
  }
};

// Delete entertainment and sport
const deleteEntertainmentAndSport = async (req, res) => {
  try {
    const { id } = req.params;
    const entertainmentAndSportId = parseInt(id);

    if (isNaN(entertainmentAndSportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entertainment and sport ID"
      });
    }

    const entertainmentAndSport = await prisma.entertainmentAndSport.findUnique({
      where: { id: entertainmentAndSportId },
      include: { EntertainmentAndSportGallery: true }
    });

    if (!entertainmentAndSport) {
      return res.status(404).json({
        success: false,
        message: "Entertainment and sport not found"
      });
    }

    // Delete gallery images from Cloudinary
    for (const img of entertainmentAndSport.EntertainmentAndSportGallery) {
      if (img.imagePath) {
        await deleteCloudinaryImage(img.imagePath);
      }
    }

    // Delete gallery images from DB
    await prisma.entertainmentAndSportGallery.deleteMany({
      where: { entertainmentAndSportId: entertainmentAndSportId }
    });

    // Delete the entertainment and sport
    await prisma.entertainmentAndSport.delete({
      where: { id: entertainmentAndSportId }
    });

    res.status(200).json({
      success: true,
      message: "Entertainment and sport deleted successfully"
    });
  } catch (error) {
    console.error('❌ Error deleting entertainment and sport:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete entertainment and sport",
      error: error.message
    });
  }
};

// Delete gallery image
const deleteEntertainmentAndSportGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryImageId = parseInt(id);

    if (isNaN(galleryImageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery image ID"
      });
    }

    const galleryImage = await prisma.entertainmentAndSportGallery.findUnique({
      where: { id: galleryImageId }
    });

    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found"
      });
    }

    // Delete from Cloudinary
    if (galleryImage.imagePath) {
      await deleteCloudinaryImage(galleryImage.imagePath);
    }

    // Delete from DB
    await prisma.entertainmentAndSportGallery.delete({
      where: { id: galleryImageId }
    });

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully"
    });
  } catch (error) {
    console.error('❌ Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
      error: error.message
    });
  }
};

module.exports = {
  getEntertainmentAndSports,
  getEntertainmentAndSportById,
  createEntertainmentAndSport,
  updateEntertainmentAndSport,
  deleteEntertainmentAndSport,
  deleteEntertainmentAndSportGalleryImage,
}; 