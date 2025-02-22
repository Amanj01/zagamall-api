const prisma = require("../prisma");

const createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contactMessage = await prisma.contactMe.create({
      data: {
        name,
        email,
        message,
      },
    });

    res.status(201).json({
      message: "Contact message created successfully",
      contactMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createContactMessage,
};
