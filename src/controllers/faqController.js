const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all FAQs with consistent response
const getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.FAQ.findMany({
      orderBy: { orderNumber: 'asc' },
    });
    res.status(200).json({
      success: true,
      message: "FAQs retrieved successfully",
      data: faqs
    });
  } catch (error) {
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
    const parsedOrderNumber = orderNumber ? parseInt(orderNumber) : 0;
    if (orderNumber && (isNaN(parsedOrderNumber) || parsedOrderNumber < 0)) {
      return res.status(400).json({
        success: false,
        message: "Order number must be a non-negative integer"
      });
    }
    // Optional: Check for duplicate question
    const existingFaq = await prisma.FAQ.findFirst({
      where: { question: { equals: question.trim(), mode: 'insensitive' } }
    });
    if (existingFaq) {
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
    const existingFaq = await prisma.FAQ.findUnique({
      where: { id: faqId },
    });
    if (!existingFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }
    // Optional: Check for duplicate question (excluding current FAQ)
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

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};
