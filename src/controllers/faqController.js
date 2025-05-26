const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all FAQs
const getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.FAQ.findMany({
      orderBy: { orderNumber: 'asc' },
    });
    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error in getAllFaqs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific FAQ by ID
const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await prisma.FAQ.findUnique({
      where: { id: parseInt(id) },
    });

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    console.error("Error in getFaqById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new FAQ
const createFaq = async (req, res) => {
  try {
    const { question, answer, category, orderNumber } = req.body;
    const faq = await prisma.FAQ.create({
      data: {
        question,
        answer,
        category,
        orderNumber: orderNumber ? parseInt(orderNumber) : 0,
      },
    });

    res.status(201).json({ message: "FAQ created successfully", faq });
  } catch (error) {
    console.error("Error in createFaq:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a FAQ
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, orderNumber } = req.body;

    const existingFaq = await prisma.FAQ.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const updatedFaq = await prisma.FAQ.update({
      where: { id: parseInt(id) },
      data: {
        question,
        answer,
        category,
        orderNumber: orderNumber ? parseInt(orderNumber) : undefined,
      },
    });

    res.status(200).json({
      message: "FAQ updated successfully",
      faq: updatedFaq,
    });
  } catch (error) {
    console.error("Error in updateFaq:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a FAQ
const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFaq = await prisma.FAQ.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    await prisma.FAQ.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    return res.status(500).json({ 
      error: error.message, 
      stack: error.stack
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
