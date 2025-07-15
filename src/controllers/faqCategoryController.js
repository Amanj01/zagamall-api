const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all FAQ categories with pagination
const getAllFAQCategories = async (req, res) => {
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
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.FAQCategory.count({
      where: whereClause
    });

    // Get categories with pagination
    const categories = await prisma.FAQCategory.findMany({
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
      message: "FAQ categories retrieved successfully",
      data: categories,
      meta,
      links
    });
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ categories",
      error: error.message
    });
  }
};

// Get FAQ category by ID
const getFAQCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.FAQCategory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'FAQ category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ category retrieved successfully",
      data: category
    });
  } catch (error) {
    console.error('Error fetching FAQ category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQ category'
    });
  }
};

// Create new FAQ category
const createFAQCategory = async (req, res) => {
  try {
    const { name, description, orderNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if orderNumber already exists
    if (orderNumber) {
      const existingCategory = await prisma.FAQCategory.findFirst({
        where: { orderNumber: parseInt(orderNumber) }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: `Order number ${orderNumber} is already taken by category "${existingCategory.name}". Please choose a different order number.`
        });
      }
    }

    const category = await prisma.FAQCategory.create({
      data: {
        name,
        description: description || '',
        orderNumber: orderNumber || 1
      }
    });

    res.status(201).json({
      success: true,
      message: "FAQ category created successfully",
      data: category
    });
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ category'
    });
  }
};

// Update FAQ category
const updateFAQCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, orderNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if orderNumber already exists (excluding current category)
    if (orderNumber) {
      const existingCategory = await prisma.FAQCategory.findFirst({
        where: { 
          orderNumber: parseInt(orderNumber),
          id: { not: parseInt(id) }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: `Order number ${orderNumber} is already taken by category "${existingCategory.name}". Please choose a different order number.`
        });
      }
    }

    const category = await prisma.FAQCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || '',
        orderNumber: orderNumber || 1
      }
    });

    res.status(200).json({
      success: true,
      message: "FAQ category updated successfully",
      data: category
    });
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update FAQ category'
    });
  }
};

// Get next available order number
const getNextOrderNumber = async (req, res) => {
  try {
    const maxOrder = await prisma.FAQCategory.findFirst({
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    });

    const nextOrder = (maxOrder?.orderNumber || 0) + 1;

    res.status(200).json({
      success: true,
      data: { nextOrderNumber: nextOrder }
    });
  } catch (error) {
    console.error('Error getting next order number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get next order number'
    });
  }
};

module.exports = {
  getAllFAQCategories,
  getFAQCategoryById,
  createFAQCategory,
  updateFAQCategory,
  getNextOrderNumber
}; 