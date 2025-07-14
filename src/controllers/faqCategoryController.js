const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all FAQ categories with pagination
const getAllFAQCategories = async (req, res) => {
  try {
    const categories = await prisma.FAQCategory.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQ categories'
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

    res.json({
      success: true,
      category
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

    const category = await prisma.FAQCategory.create({
      data: {
        name,
        description: description || '',
        orderNumber: orderNumber || 1
      }
    });

    res.status(201).json({
      success: true,
      category
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

    const category = await prisma.FAQCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || '',
        orderNumber: orderNumber || 1
      }
    });

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update FAQ category'
    });
  }
};

module.exports = {
  getAllFAQCategories,
  getFAQCategoryById,
  createFAQCategory,
  updateFAQCategory
}; 