const prisma = require('@prisma/client').PrismaClient ? new (require('@prisma/client').PrismaClient)() : require('@prisma/client').prisma;
const { deleteCloudinaryImage, uploadToCloudinary, deleteFile } = require("../utils/utility");

// Helper for meta/links
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

// List with pagination/search
const getAllDiningCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;
    let where = {};
    if (search) {
      where = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }
    const totalCount = await prisma.diningCategory.count({ where });
    const categories = await prisma.diningCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });
    // Patch: Ensure every category has a 'features' array
    const safeCategories = categories.map(cat => ({
      ...cat,
      features: Array.isArray(cat.features) ? cat.features : [],
    }));
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const { meta, links } = buildMetaLinks(baseUrl, pageNumber, pageSize, totalCount, search);
    res.status(200).json({
      success: true,
      message: "Dining categories retrieved successfully",
      data: safeCategories,
      meta,
      links
    });
  } catch (error) {
    console.error('Error fetching dining categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining categories',
      error: error.message,
    });
  }
};

// Get by ID
const getDiningCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dining category ID"
      });
    }
    const category = await prisma.diningCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Dining category not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Dining category retrieved successfully',
      data: category
    });
  } catch (error) {
    console.error('Error fetching dining category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dining category',
      error: error.message,
    });
  }
};

// Create
const createDiningCategory = async (req, res) => {
  try {
    const { name, description, isActive, imagePath } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }
    // Check uniqueness
    const exists = await prisma.diningCategory.findUnique({ where: { name } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'A dining category with this name already exists',
      });
    }
    // Handle features (bullet points) - parse from form data
    let featuresArr = [];
    if (req.body.features) {
      if (Array.isArray(req.body.features)) {
        featuresArr = req.body.features.map(f => String(f).trim()).filter(Boolean);
      } else if (typeof req.body.features === 'string') {
        try {
          const parsed = JSON.parse(req.body.features);
          if (Array.isArray(parsed)) {
            featuresArr = parsed.map(f => String(f).trim()).filter(Boolean);
          } else {
            featuresArr = [req.body.features.trim()].filter(Boolean);
          }
        } catch (e) {
          featuresArr = req.body.features.split(/\n|,/).map(f => f.trim()).filter(Boolean);
        }
      }
    }
    const category = await prisma.diningCategory.create({
      data: {
        name: name.trim(),
        description: description || '',
        imagePath,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Dining category created successfully',
      data: category,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A dining category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create dining category',
      error: error.message,
    });
  }
};

// Update
const updateDiningCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    const { name, description, isActive, imagePath } = req.body;
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dining category ID"
      });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }
    // Check uniqueness (exclude self)
    const exists = await prisma.diningCategory.findFirst({
      where: {
        name,
        id: { not: categoryId },
      },
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'A dining category with this name already exists',
      });
    }
    // Get existing category
    const existingCategory = await prisma.diningCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Dining category not found',
      });
    }
    // Handle features (bullet points) - parse from form data
    let featuresArr = [];
    if (req.body.features) {
      if (Array.isArray(req.body.features)) {
        featuresArr = req.body.features.map(f => String(f).trim()).filter(Boolean);
      } else if (typeof req.body.features === 'string') {
        try {
          const parsed = JSON.parse(req.body.features);
          if (Array.isArray(parsed)) {
            featuresArr = parsed.map(f => String(f).trim()).filter(Boolean);
          } else {
            featuresArr = [req.body.features.trim()].filter(Boolean);
          }
        } catch (e) {
          featuresArr = req.body.features.split(/\n|,/).map(f => f.trim()).filter(Boolean);
        }
      }
    }
    // Delete removed features and update/add new ones
    await prisma.diningCategoryFeature.deleteMany({ where: { categoryId } });
    const updatedCategory = await prisma.diningCategory.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        description: description || '',
        imagePath,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      },
    });
    res.json({
      success: true,
      message: 'Dining category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A dining category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update dining category',
      error: error.message,
    });
  }
};

// Delete
const deleteDiningCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    const existingCategory = await prisma.diningCategory.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Dining category not found',
      });
    }
    // Delete image from Cloudinary if exists
    if (existingCategory.imagePath) {
      try {
        await deleteCloudinaryImage(existingCategory.imagePath);
      } catch (err) {
        // Log but don't block deletion
        console.error('Failed to delete Cloudinary image:', err);
      }
    }
    // Delete features (cascade handled by Prisma, but explicit for clarity)
    await prisma.diningCategoryFeature.deleteMany({ where: { categoryId } });
    await prisma.diningCategory.delete({ where: { id: categoryId } });
    res.json({
      success: true,
      message: 'Dining category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting dining category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dining category',
      error: error.message,
    });
  }
};

module.exports = {
  getAllDiningCategories,
  getDiningCategoryById,
  createDiningCategory,
  updateDiningCategory,
  deleteDiningCategory,
}; 