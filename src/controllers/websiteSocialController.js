const prisma = require("../prisma");

// Get all website social links
const getWebsiteSocials = async (req, res) => {
  try {
    const socials = await prisma.websiteSocial.findMany();
    res.status(200).json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new website social link
const createWebsiteSocial = async (req, res) => {
  try {
    const { name, url } = req.body;
    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const newSocial = await prisma.websiteSocial.create({
      data: {
        name,
        url,
        icon,
      },
    });

    res.status(201).json({
      message: "Website social link created successfully",
      social: newSocial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific website social link
const updateWebsiteSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;
    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const existingSocial = await prisma.websiteSocial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Website social link not found" });
    }

    const updatedSocial = await prisma.websiteSocial.update({
      where: { id: parseInt(id) },
      data: {
        name,
        url,
        icon: icon || existingSocial.icon,
      },
    });

    res.status(200).json({
      message: "Website social link updated successfully",
      social: updatedSocial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific website social link
const deleteWebsiteSocial = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSocial = await prisma.websiteSocial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Website social link not found" });
    }

    await prisma.websiteSocial.delete({ where: { id: parseInt(id) } });
    res
      .status(200)
      .json({ message: "Website social link deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWebsiteSocials,
  createWebsiteSocial,
  updateWebsiteSocial,
  deleteWebsiteSocial,
};
