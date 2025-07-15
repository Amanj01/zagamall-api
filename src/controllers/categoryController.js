const prisma = require("../prisma");

// Get all categories with pagination
const getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search
    const whereClause = search ? {
      categoryName: {
        contains: search,
        mode: 'insensitive'
      }
    } : {};

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.category.count({
      where: whereClause
    });

    // Get categories with pagination
    const categories = await prisma.category.findMany({
      where: whereClause,
      skip: skip,
      take: pageSize,
      orderBy: orderBy
    });

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
      message: "Categories retrieved successfully",
      data: categories,
      meta,
      links
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

// Get a specific category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        stores: true,
      },
    });

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch category",
      error: error.message 
    });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName || categoryName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findFirst({
      where: { 
        categoryName: { 
          equals: categoryName.trim(), 
          mode: 'insensitive' 
        } 
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryName}" already exists. Please choose a different name.`
      });
    }

    const category = await prisma.category.create({
      data: {
        categoryName: categoryName.trim(),
      },
    });

    res.status(201).json({ 
      success: true,
      message: "Category created successfully", 
      data: category 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create category",
      error: error.message 
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!categoryName || categoryName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    // Check if the new category name already exists (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        categoryName: { 
          equals: categoryName.trim(), 
          mode: 'insensitive' 
        },
        id: { not: parseInt(id) }
      }
    });

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryName}" already exists. Please choose a different name.`
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        categoryName: categoryName.trim(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update category",
      error: error.message 
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
};
