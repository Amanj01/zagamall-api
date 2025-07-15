const prisma = require("../prisma");
const { deleteCloudinaryImage, uploadToCloudinary, deleteFile } = require("../utils/utility");

function buildMetaLinks(baseUrl, page, limit, total, search) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  return {
    meta: {
      currentPage: page,
      totalPages,
      totalCount: total,
      pageSize: limit,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null
    },
    links: {
      self: `${baseUrl}?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
      first: `${baseUrl}?page=1&limit=${limit}${search ? `&search=${search}` : ''}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}${search ? `&search=${search}` : ''}`,
      next: hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
      prev: hasPreviousPage ? `${baseUrl}?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null
    }
  };
}

function isValidTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

// List with pagination/search
const getAllDinings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", diningCategoryId } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    if (diningCategoryId) {
      where.diningCategoryId = parseInt(diningCategoryId);
    }
    const totalCount = await prisma.dining.count({ where });
    const dinings = await prisma.dining.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: { diningCategory: true, location: true },
    });
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { meta, links } = buildMetaLinks(baseUrl, pageNumber, pageSize, totalCount, search);
    res.status(200).json({
      success: true,
      message: "Dining options retrieved successfully",
      data: dinings,
      meta,
      links
    });
  } catch (error) {
    console.error("Error fetching dinings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dining options",
      error: error.message,
    });
  }
};

// Get by ID
const getDiningById = async (req, res) => {
  try {
    const { id } = req.params;
    const diningId = parseInt(id);
    
    if (isNaN(diningId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dining ID"
      });
    }
    
    const dining = await prisma.dining.findUnique({
      where: { id: diningId },
      include: { diningCategory: true, location: true },
    });
    
    if (!dining) {
      return res.status(404).json({
        success: false,
        message: "Dining option not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Dining option retrieved successfully",
      data: dining
    });
  } catch (error) {
    console.error("Error fetching dining option:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dining option",
      error: error.message,
    });
  }
};

// Create
const createDining = async (req, res) => {
  try {
    console.log('Received dining creation request:', {
      body: req.body,
      file: req.file ? 'File present' : 'No file'
    });

    let { name, diningCategoryId, locationId, description, openingTime, closingTime, rating, isShowInHome, imagePath } = req.body;
    
    console.log('Parsed fields:', {
      name,
      diningCategoryId,
      locationId,
      description,
      openingTime,
      closingTime,
      rating,
      isShowInHome
    });

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Dining name is required and cannot be empty" 
      });
    }

    if (!diningCategoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category is required" 
      });
    }

    if (!locationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Location is required" 
      });
    }

    // Validate dining category exists
    const diningCategory = await prisma.diningCategory.findUnique({ where: { id: parseInt(diningCategoryId) } });
    if (!diningCategory) {
      return res.status(400).json({ 
        success: false, 
        message: "Selected dining category does not exist" 
      });
    }

    // Get or create a regular category for dining
    let regularCategory = await prisma.category.findFirst({ 
      where: { categoryName: { contains: 'Dining', mode: 'insensitive' } } 
    });
    
    if (!regularCategory) {
      // Create a default dining category if it doesn't exist
      regularCategory = await prisma.category.create({
        data: { categoryName: 'Dining' }
      });
    }

    // Validate location exists
    const location = await prisma.location.findUnique({ where: { id: parseInt(locationId) } });
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        message: "Selected location does not exist" 
      });
    }

    // Validate times
    if (openingTime && !isValidTime(openingTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid opening time format (HH:MM)" 
      });
    }
    if (closingTime && !isValidTime(closingTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid closing time format (HH:MM)" 
      });
    }
    // Only validate if both times are provided
    if (openingTime && closingTime) {
      // Allow same-day closing (e.g., 23:00 to 02:00 next day)
      // Only validate if closing time is significantly before opening time (likely a mistake)
      const openingMinutes = parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1]);
      const closingMinutes = parseInt(closingTime.split(':')[0]) * 60 + parseInt(closingTime.split(':')[1]);
      // If closing time is more than 2 hours before opening time, it's likely a mistake
      if (closingMinutes < openingMinutes - 120) {
        return res.status(400).json({ 
          success: false, 
          message: "Closing time seems too early compared to opening time. Please check your times." 
        });
      }
    }
    // Validate rating
    if (rating !== undefined && rating !== null) {
      const r = parseFloat(rating);
      if (isNaN(r) || r < 1 || r > 10) {
        return res.status(400).json({ 
          success: false, 
          message: "Rating must be a number between 1 and 10" 
        });
      }
      rating = r;
    }
    // Handle image upload (Cloudinary)
    let finalImagePath = imagePath || null;
    if (req.file) {
      console.log('Image file received:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      try {
        // Convert buffer to base64 for Cloudinary
        const buffer = req.file.buffer;
        const base64String = buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
        console.log('Uploading to Cloudinary with dataURI length:', dataURI.length);
        finalImagePath = await uploadToCloudinary(dataURI, 'dining');
        console.log('Cloudinary upload successful:', finalImagePath);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image to Cloudinary', 
          error: err.message 
        });
      }
    } else {
      console.log('No image file received in request');
    }
    const dining = await prisma.dining.create({
      data: {
        name: name.trim(),
        categoryId: regularCategory.id, // Use the regular category ID
        diningCategoryId: diningCategoryId ? parseInt(diningCategoryId) : null,
        locationId: locationId ? parseInt(locationId) : null,
        description: description ? description.trim() : '',
        hours: openingTime && closingTime ? `${openingTime} - ${closingTime}` : null,
        rating: rating !== undefined ? parseFloat(rating) : null,
        imagePath: finalImagePath,
        isShowInHome: isShowInHome === "true" || isShowInHome === true,
      },
      include: { diningCategory: true, location: true },
    });
    res.status(201).json({
      success: true,
      message: "Dining option created successfully",
      data: dining,
    });
  } catch (error) {
    console.error("Error creating dining option:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create dining option", 
      error: error.message 
    });
  }
};

// Update
const updateDining = async (req, res) => {
  try {
    const { id } = req.params;
    const diningId = parseInt(id);
    let { name, diningCategoryId, locationId, description, openingTime, closingTime, rating, isShowInHome, imagePath, existingImage } = req.body;
    
    if (isNaN(diningId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid dining ID" 
      });
    }
    
    const existingDining = await prisma.dining.findUnique({ where: { id: diningId } });
    if (!existingDining) {
      return res.status(404).json({ 
        success: false, 
        message: "Dining option not found" 
      });
    }
    
    // Validation
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Dining name cannot be empty" 
      });
    }
    
    // Validate dining category exists if being updated
    if (diningCategoryId) {
      const diningCategory = await prisma.diningCategory.findUnique({ where: { id: parseInt(diningCategoryId) } });
      if (!diningCategory) {
        return res.status(400).json({ 
          success: false, 
          message: "Selected dining category does not exist" 
        });
      }
    }
    
    // Validate location exists if being updated
    if (locationId) {
      const location = await prisma.location.findUnique({ where: { id: parseInt(locationId) } });
      if (!location) {
        return res.status(400).json({ 
          success: false, 
          message: "Selected location does not exist" 
        });
      }
    }
    
    // Validate times
    if (openingTime && !isValidTime(openingTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid opening time format (HH:MM)" 
      });
    }
    if (closingTime && !isValidTime(closingTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid closing time format (HH:MM)" 
      });
    }
    // Only validate if both times are provided
    if (openingTime && closingTime) {
      // Allow same-day closing (e.g., 23:00 to 02:00 next day)
      // Only validate if closing time is significantly before opening time (likely a mistake)
      const openingMinutes = parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1]);
      const closingMinutes = parseInt(closingTime.split(':')[0]) * 60 + parseInt(closingTime.split(':')[1]);
      // If closing time is more than 2 hours before opening time, it's likely a mistake
      if (closingMinutes < openingMinutes - 120) {
        return res.status(400).json({ 
          success: false, 
          message: "Closing time seems too early compared to opening time. Please check your times." 
        });
      }
    }
    // Validate rating
    if (rating !== undefined && rating !== null) {
      const r = parseFloat(rating);
      if (isNaN(r) || r < 1 || r > 10) {
        return res.status(400).json({ 
          success: false, 
          message: "Rating must be a number between 1 and 10" 
        });
      }
      rating = r;
    }
    
    // Handle image upload (Cloudinary)
    let finalImagePath = existingDining.imagePath; // Default to existing image
    
    if (req.file) {
      console.log('Image file received (update):', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      try {
        // Convert buffer to base64 for Cloudinary
        const buffer = req.file.buffer;
        const base64String = buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
        console.log('Uploading to Cloudinary with dataURI length (update):', dataURI.length);
        finalImagePath = await uploadToCloudinary(dataURI, 'dining');
        console.log('Cloudinary upload successful (update):', finalImagePath);
        // Delete old Cloudinary image if different
        if (existingDining.imagePath && existingDining.imagePath !== finalImagePath) {
          await deleteCloudinaryImage(existingDining.imagePath);
        }
      } catch (err) {
        console.error('Cloudinary upload failed (update):', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image to Cloudinary', 
          error: err.message 
        });
      }
    } else if (existingImage !== undefined) {
      // Handle existingImage field from frontend
      if (existingImage === '') {
        // Remove image
        if (existingDining.imagePath) {
          await deleteCloudinaryImage(existingDining.imagePath);
        }
        finalImagePath = null;
      } else if (existingImage) {
        // Keep existing image
        finalImagePath = existingImage;
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (diningCategoryId !== undefined) {
      updateData.diningCategoryId = parseInt(diningCategoryId);
      // Keep the existing categoryId for regular category relationship
    }
    if (locationId !== undefined) updateData.locationId = parseInt(locationId);
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (rating !== undefined) updateData.rating = rating;
    if (finalImagePath !== undefined) updateData.imagePath = finalImagePath;
    if (isShowInHome !== undefined) updateData.isShowInHome = isShowInHome === "true" || isShowInHome === true;
    
    const updatedDining = await prisma.dining.update({
      where: { id: diningId },
      data: updateData,
      include: { diningCategory: true, location: true },
    });
    
    console.log('Sending update response:', {
      success: true,
      message: "Dining option updated successfully",
      data: updatedDining,
    });
    res.status(200).json({
      success: true,
      message: "Dining option updated successfully",
      data: updatedDining,
    });
  } catch (error) {
    console.error("Error updating dining option:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update dining option", 
      error: error.message 
    });
  }
};

// Delete
const deleteDining = async (req, res) => {
  try {
    const { id } = req.params;
    const diningId = parseInt(id);
    
    if (isNaN(diningId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid dining ID" 
      });
    }
    
    const existingDining = await prisma.dining.findUnique({ where: { id: diningId } });
    if (!existingDining) {
      // If already deleted, return success (idempotent)
      return res.status(200).json({
        success: true,
        message: "Dining option already deleted",
        data: null
      });
    }
    
    // Delete image from Cloudinary if exists
    if (existingDining.imagePath) {
      try {
        await deleteCloudinaryImage(existingDining.imagePath);
      } catch (err) {
        // Log but don't block deletion
        console.error('Failed to delete Cloudinary image:', err);
      }
    }
    
    // Now delete from database
    try {
      await prisma.dining.delete({ where: { id: diningId } });
    } catch (error) {
      // Handle P2025 error (record not found)
      if (error.code === 'P2025') {
        // Record already deleted, treat as success (idempotent)
        return res.status(200).json({
          success: true,
          message: "Dining option already deleted",
          data: null
        });
      }
      // Other errors should be thrown to the outer catch
      throw error;
    }
    
    res.status(200).json({
      success: true,
      message: "Dining option deleted successfully",
      data: null
    });
  } catch (error) {
    console.error("Error deleting dining option:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete dining option", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllDinings,
  getDiningById,
  createDining,
  updateDining,
  deleteDining,
};
