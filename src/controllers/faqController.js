const prisma = require("../prisma");

// Get all FAQs
const getAllFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific FAQ by ID
const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({
      where: { id: parseInt(id) },
    });

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new FAQ
const createFaq = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        category,
      },
    });

    res.status(201).json({ message: "FAQ created successfully", faq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a FAQ
const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const existingFaq = await prisma.faq.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const updatedFaq = await prisma.faq.update({
      where: { id: parseInt(id) },
      data: {
        question,
        answer,
        category,
      },
    });

    res.status(200).json({
      message: "FAQ updated successfully",
      faq: updatedFaq,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
};
