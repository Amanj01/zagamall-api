const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all about sections
const getAllAboutSections = async (req, res) => {
  try {
    const sections = await prisma.aboutSection.findMany();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific about section
const getAboutSection = async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['ourStory', 'ourValues', 'factsAndFigures'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const aboutSection = await prisma.aboutSection.findUnique({
      where: { sectionName: section },
    });

    if (!aboutSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json(aboutSection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create an about section
const createAboutSection = async (req, res) => {
  try {
    const { sectionName, content } = req.body;
    const validSections = ['ourStory', 'ourValues', 'factsAndFigures'];
    
    if (!validSections.includes(sectionName)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const existingSection = await prisma.aboutSection.findUnique({
      where: { sectionName },
    });

    if (existingSection) {
      return res.status(400).json({ 
        message: `Section '${sectionName}' already exists. Use PUT to update.` 
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const section = await prisma.aboutSection.create({
      data: {
        sectionName,
        content,
        imagePath,
      },
    });

    res.status(201).json({ 
      message: "About section created successfully", 
      section 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an about section
const updateAboutSection = async (req, res) => {
  try {
    const { section } = req.params;
    const { content } = req.body;
    const validSections = ['ourStory', 'ourValues', 'factsAndFigures'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const existingSection = await prisma.aboutSection.findUnique({
      where: { sectionName: section },
    });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    let updatedSection;
    
    if (existingSection) {
      updatedSection = await prisma.aboutSection
        .update({
          where: { sectionName: section },
          data: {
            content,
            imagePath: imagePath || existingSection.imagePath,
          },
        })
        .then((data) => {
          if (req.file && existingSection.imagePath) {
            deleteFile(existingSection.imagePath);
          }
          return data;
        });
    } else {
      updatedSection = await prisma.aboutSection.create({
        data: {
          sectionName: section,
          content,
          imagePath,
        },
      });
    }

    res.status(200).json({
      message: "About section updated successfully",
      section: updatedSection,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an about section
const deleteAboutSection = async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['ourStory', 'ourValues', 'factsAndFigures'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section name" });
    }

    const existingSection = await prisma.aboutSection.findUnique({
      where: { sectionName: section },
    });

    if (!existingSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    await prisma.aboutSection.delete({
      where: { sectionName: section },
    });

    if (existingSection.imagePath) {
      deleteFile(existingSection.imagePath);
    }

    res.status(200).json({ message: "About section deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAboutSections,
  getAboutSection,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
};
