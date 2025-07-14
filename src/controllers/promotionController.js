const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

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

// Get all promotions with pagination, search, and sorting
const getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    
    let where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { period: { contains: search, mode: "insensitive" } },
        { stores: { contains: search, mode: "insensitive" } }
      ];
    }
    
    const totalCount = await prisma.promotion.count({ where });
    const promotions = await prisma.promotion.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { meta, links } = buildMetaLinks(baseUrl, pageNumber, pageSize, totalCount, search);
    
    res.status(200).json({
      success: true,
      message: "Promotions retrieved successfully",
      data: promotions,
      meta,
      links
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promotions",
      error: error.message,
    });
  }
};

// Get a specific promotion by ID
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotionId = parseInt(id);
    
    if (isNaN(promotionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion ID"
      });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion retrieved successfully",
      data: promotion
    });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promotion",
      error: error.message,
    });
  }
};

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    console.log('Received promotion creation request:', {
      body: req.body,
      file: req.file ? 'File present' : 'No file'
    });

    const { title, period, stores, description, isShowInHome, imagePath } = req.body;
    
    console.log('Parsed fields:', {
      title,
      period,
      stores,
      description,
      isShowInHome
    });

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Promotion title is required and cannot be empty" 
      });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: title.trim(),
        period,
        stores,
        description: description ? description.trim() : '',
        imagePath,
        isShowInHome: isShowInHome === "true" || isShowInHome === true,
      },
    });
    
    console.log('Sending create response:', {
      success: true,
      message: "Promotion created successfully",
      data: promotion,
    });
    
    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: promotion
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create promotion",
      error: error.message,
    });
  }
};

// Update a promotion
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotionId = parseInt(id);
    const { title, period, stores, description, isShowInHome, imagePath, existingImage } = req.body;
    
    if (isNaN(promotionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid promotion ID" 
      });
    }
    
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });
    
    if (!existingPromotion) {
      return res.status(404).json({ 
        success: false, 
        message: "Promotion not found" 
      });
    }
    
    // Validation
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Promotion title cannot be empty" 
      });
    }
    
    // Handle image upload (Cloudinary)
    let finalImagePath = existingPromotion.imagePath; // Default to existing image
    
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
        const { uploadToCloudinary } = require("../utils/utility");
        finalImagePath = await uploadToCloudinary(dataURI, 'promotions');
        console.log('Cloudinary upload successful (update):', finalImagePath);
        // Delete old Cloudinary image if different
        if (existingPromotion.imagePath && existingPromotion.imagePath !== finalImagePath) {
          await deleteCloudinaryImage(existingPromotion.imagePath);
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
        if (existingPromotion.imagePath) {
          await deleteCloudinaryImage(existingPromotion.imagePath);
        }
        finalImagePath = null;
      } else if (existingImage) {
        // Keep existing image
        finalImagePath = existingImage;
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (period !== undefined) updateData.period = period;
    if (stores !== undefined) updateData.stores = stores;
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (finalImagePath !== undefined) updateData.imagePath = finalImagePath;
    if (isShowInHome !== undefined) updateData.isShowInHome = isShowInHome === "true" || isShowInHome === true;
    
    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: updateData,
    });
    
    console.log('Sending update response:', {
      success: true,
      message: "Promotion updated successfully",
      data: updatedPromotion,
    });
    
    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      data: updatedPromotion
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update promotion", 
      error: error.message 
    });
  }
};

// Delete a promotion
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotionId = parseInt(id);
    
    if (isNaN(promotionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid promotion ID" 
      });
    }
    
    const existingPromotion = await prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!existingPromotion) {
      // If already deleted, return success (idempotent)
      return res.status(200).json({
        success: true,
        message: "Promotion already deleted",
        data: null
      });
    }
    
    // Delete image from Cloudinary if exists
    if (existingPromotion.imagePath) {
      try {
        await deleteCloudinaryImage(existingPromotion.imagePath);
      } catch (err) {
        console.error('Failed to delete Cloudinary image:', err);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }
    
    await prisma.promotion.delete({
      where: { id: promotionId },
    });
    
    console.log('Sending delete response:', {
      success: true,
      message: "Promotion deleted successfully",
      data: null
    });
    
    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
      data: null
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete promotion", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
