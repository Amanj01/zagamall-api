const prisma = require("../prisma");

// Get all FAQs with pagination, search, and meta
const getAllFaqs = async (req, res) => {
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
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause with validation
    const orderBy = {};
    const validSortFields = ['id', 'question', 'answer', 'category', 'orderNumber', 'createdAt', 'updatedAt'];
    const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'orderNumber';
    orderBy[validSortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.FAQ.count({
      where: whereClause
    });

    // Get FAQs with pagination
    const faqs = await prisma.FAQ.findMany({
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
      message: "FAQs retrieved successfully",
      data: faqs,
      meta,
      links
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error.message
    });
  }
};

// Get a specific FAQ by ID with validation and consistent response
const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const faqId = parseInt(id);
    if (isNaN(faqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID"
      });
    }
    const faq = await prisma.FAQ.findUnique({
      where: { id: faqId },
    });
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully",
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ",
      error: error.message
    });
  }
};

// Create a new FAQ with validation and consistent response
const createFaq = async (req, res) => {
  try {
    const { question, answer, category, orderNumber } = req.body;
    
    // Validation
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question is required and cannot be empty"
      });
    }
    
    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answer is required and cannot be empty"
      });
    }
    
    if (question.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Question cannot exceed 255 characters"
      });
    }
    
    if (answer.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Answer cannot exceed 1000 characters"
      });
    }
    
    const parsedOrderNumber = parseInt(orderNumber);
    if (isNaN(parsedOrderNumber)) {
      return res.status(400).json({
        success: false,
        message: "Order number must be a valid number"
      });
    }
    if (parsedOrderNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Order number must be a positive integer"
      });
    }
    
    // Check if order number already exists
    const existingFaqWithOrder = await prisma.FAQ.findFirst({
      where: { orderNumber: parsedOrderNumber }
    });
    
    if (existingFaqWithOrder) {
      return res.status(409).json({
        success: false,
        message: `Order number ${parsedOrderNumber} is already taken. Please choose a different order number.`
      });
    }
    
    // Check if question already exists
    const existingFaqWithQuestion = await prisma.FAQ.findFirst({
      where: { question: { equals: question.trim(), mode: 'insensitive' } }
    });
    
    if (existingFaqWithQuestion) {
      return res.status(409).json({
        success: false,
        message: "A FAQ with this question already exists"
      });
    }
    
    const faq = await prisma.FAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category ? category.trim() : null,
        orderNumber: parsedOrderNumber,
      },
    });
    
    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A FAQ with this question or order number already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
      error: error.message
    });
  }
};

// Update a FAQ with validation and consistent response
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, orderNumber } = req.body;
    const faqId = parseInt(id);
    
    if (isNaN(faqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID"
      });
    }
    
    // Check if FAQ exists
    const existingFaq = await prisma.FAQ.findUnique({
      where: { id: faqId },
    });
    
    if (!existingFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }
    
    // Validation for updated fields
    if (question && question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question cannot be empty"
      });
    }
    
    if (answer && answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answer cannot be empty"
      });
    }
    
    if (question && question.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Question cannot exceed 255 characters"
      });
    }
    
    if (answer && answer.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Answer cannot exceed 1000 characters"
      });
    }
    
    // Check for duplicate question (excluding current FAQ)
    if (question) {
      const duplicateFaq = await prisma.FAQ.findFirst({
        where: {
          question: { equals: question.trim(), mode: 'insensitive' },
          NOT: { id: faqId }
        }
      });
      if (duplicateFaq) {
        return res.status(409).json({
          success: false,
          message: "A FAQ with this question already exists"
        });
      }
    }
    
    // Check for duplicate order number (excluding current FAQ)
    if (orderNumber) {
      const parsedOrderNumber = parseInt(orderNumber);
      if (isNaN(parsedOrderNumber)) {
        return res.status(400).json({
          success: false,
          message: "Order number must be a valid number"
        });
      }
      if (parsedOrderNumber < 1) {
        return res.status(400).json({
          success: false,
          message: "Order number must be a positive integer"
        });
      }
      
      const duplicateOrder = await prisma.FAQ.findFirst({
        where: {
          orderNumber: parsedOrderNumber,
          NOT: { id: faqId }
        }
      });
      if (duplicateOrder) {
        return res.status(409).json({
          success: false,
          message: `Order number ${parsedOrderNumber} is already taken. Please choose a different order number.`
        });
      }
    }
    
    const updatedFaq = await prisma.FAQ.update({
      where: { id: faqId },
      data: {
        question: question ? question.trim() : undefined,
        answer: answer ? answer.trim() : undefined,
        category: category ? category.trim() : undefined,
        orderNumber: orderNumber ? parseInt(orderNumber) : undefined,
      },
    });
    
    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: updatedFaq
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A FAQ with this question or order number already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
      error: error.message
    });
  }
};

// Delete a FAQ with consistent response
const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faqId = parseInt(id);
    if (isNaN(faqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID"
      });
    }
    const existingFaq = await prisma.FAQ.findUnique({
      where: { id: faqId },
    });
    if (!existingFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }
    await prisma.FAQ.delete({
      where: { id: faqId },
    });
    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: error.message
    });
  }
};

// Get all unique categories
const getFaqCategories = async (req, res) => {
  try {
    const categories = await prisma.FAQ.findMany({
      select: {
        category: true
      }
    });
    
    // Use Set to get unique categories
    const uniqueCategories = [...new Set(
      categories
        .map(item => item.category)
        .filter(category => category && category.trim() !== '')
    )].sort();
    
    res.status(200).json({
      success: true,
      message: "FAQ categories retrieved successfully",
      data: uniqueCategories
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

// Get FAQs by category
const getFaqsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Category parameter is required"
      });
    }
    
    const faqs = await prisma.FAQ.findMany({
      where: {
        category: {
          equals: category.trim(),
          mode: 'insensitive'
        }
      },
      orderBy: { orderNumber: 'asc' }
    });
    
    res.status(200).json({
      success: true,
      message: `FAQs for category '${category}' retrieved successfully`,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs by category",
      error: error.message
    });
  }
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  getFaqCategories,
  getFaqsByCategory,
};
