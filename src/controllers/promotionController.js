const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

function buildMetaLinks(baseUrl, page, limit, total, search, sortBy, sortOrder) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  const searchParam = search ? `&search=${search}` : '';
  const sortParams = sortBy && sortOrder ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : '';
  
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
      self: `${baseUrl}?page=${page}&limit=${limit}${searchParam}${sortParams}`,
      first: `${baseUrl}?page=1&limit=${limit}${searchParam}${sortParams}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}${searchParam}${sortParams}`,
      next: hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}${searchParam}${sortParams}` : null,
      prev: hasPreviousPage ? `${baseUrl}?page=${page - 1}&limit=${limit}${searchParam}${sortParams}` : null
    }
  };
}

// Get all promotions with pagination, search, and sorting
const getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "date", sortOrder = "desc" } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    
    let where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { participatingStores: { contains: search, mode: "insensitive" } }
      ];
    }
    
    // Validate sortBy field to ensure it exists in CurrentPromotion table
    const validSortFields = ["id", "title", "description", "participatingStores", "date"];
    const validSortBy = validSortFields.includes(sortBy) ? sortBy : "date";
    
    const totalCount = await prisma.currentPromotion.count({ where });
    const promotions = await prisma.currentPromotion.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { [validSortBy]: sortOrder },
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { meta, links } = buildMetaLinks(baseUrl, pageNumber, pageSize, totalCount, search, validSortBy, sortOrder);
    
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

    const promotion = await prisma.currentPromotion.findUnique({
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
    const { title, description, participatingStores, date, endDate } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Promotion title is required and cannot be empty" 
      });
    }
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Promotion date is required"
      });
    }

    const promotion = await prisma.currentPromotion.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        participatingStores,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
      },
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
    const { title, description, participatingStores, date, endDate } = req.body;
    
    if (isNaN(promotionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid promotion ID" 
      });
    }
    
    const existingPromotion = await prisma.currentPromotion.findUnique({
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
    if (date !== undefined && !date) {
      return res.status(400).json({
        success: false,
        message: "Promotion date is required"
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (participatingStores !== undefined) updateData.participatingStores = participatingStores;
    if (date !== undefined) updateData.date = new Date(date);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    
    const updatedPromotion = await prisma.currentPromotion.update({
      where: { id: promotionId },
      data: updateData,
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
    
    const existingPromotion = await prisma.currentPromotion.findUnique({ where: { id: promotionId } });
    if (!existingPromotion) {
      // If already deleted, return success (idempotent)
      return res.status(200).json({
        success: true,
        message: "Promotion already deleted",
        data: null
      });
    }
    
    await prisma.currentPromotion.delete({
      where: { id: promotionId },
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
