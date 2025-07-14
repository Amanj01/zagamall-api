const prisma = require("../prisma");
const { uploadToCloudinary } = require('../utils/utility');

// Get all about sections with pagination, search, and meta
const getAboutSections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "asc"
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Validate sortBy field
    const validSortFields = ['id', 'title', 'description', 'image', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Build order by clause
    const orderBy = {};
    orderBy[sortField] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.about.count({ where: whereClause });

    // Get about sections with pagination
    const aboutSections = await prisma.about.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
      include: {
        factsAndFigures: true,
        ourValues: true,
      },
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

    res.status(200).json({
      success: true,
      message: "About sections retrieved successfully",
      data: aboutSections,
      meta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch about sections",
      error: error.message
    });
  }
};

// Get single about section by ID
const getAboutSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutId = parseInt(id);
    if (isNaN(aboutId)) {
      return res.status(400).json({ success: false, message: "Invalid about section ID" });
    }
    const aboutSection = await prisma.about.findUnique({
      where: { id: aboutId },
      include: { factsAndFigures: true, ourValues: true },
    });
    if (!aboutSection) {
      return res.status(404).json({ success: false, message: "About section not found" });
    }
    res.status(200).json({ success: true, data: aboutSection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch about section", error: error.message });
  }
};

// Create new about section
const createAboutSection = async (req, res) => {
  try {
    const { title, description, factsAndFigures, ourValues } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title is required and cannot be empty" });
    }
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'about');
    }
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }
    if (title.length > 255) {
      return res.status(400).json({ success: false, message: "Title cannot exceed 255 characters" });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ success: false, message: "Description cannot exceed 1000 characters" });
    }
    // Check if title already exists
    const existingAboutWithTitle = await prisma.about.findFirst({ where: { title: { equals: title.trim(), mode: 'insensitive' } } });
    if (existingAboutWithTitle) {
      return res.status(409).json({ success: false, message: "An about section with this title already exists" });
    }
    const aboutSection = await prisma.about.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        image: imageUrl,
        factsAndFigures: factsAndFigures && Array.isArray(factsAndFigures) ? {
          create: factsAndFigures.map(f => ({ number: f.number, description: f.description }))
        } : undefined,
        ourValues: ourValues && Array.isArray(ourValues) ? {
          create: ourValues.map(v => ({ title: v.title, description: v.description }))
        } : undefined
      },
      include: { factsAndFigures: true, ourValues: true }
    });
    res.status(201).json({ success: true, message: "About section created successfully", data: aboutSection });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: "An about section with this title already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to create about section", error: error.message });
  }
};

// Update about section
const updateAboutSection = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutId = parseInt(id);
    const { title, description, factsAndFigures, ourValues } = req.body;
    if (isNaN(aboutId)) {
      return res.status(400).json({ success: false, message: "Invalid about section ID" });
    }
    // Check if about section exists
    const existingAboutSection = await prisma.about.findUnique({ where: { id: aboutId }, include: { factsAndFigures: true, ourValues: true } });
    if (!existingAboutSection) {
      return res.status(404).json({ success: false, message: "About section not found" });
    }
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'about');
    }
    // Check for unique title
    if (title && title !== existingAboutSection.title) {
      const titleConflict = await prisma.about.findFirst({ where: { title: { equals: title.trim(), mode: 'insensitive' } } });
      if (titleConflict) {
        return res.status(409).json({ success: false, message: "An about section with this title already exists" });
      }
    }
    // Prepare nested updates for facts and values
    const factsToUpsert = factsAndFigures && Array.isArray(factsAndFigures) ? factsAndFigures.map(f => ({
      where: { id: f.id || 0 },
      update: { number: f.number, description: f.description },
      create: { number: f.number, description: f.description }
    })) : [];
    const valuesToUpsert = ourValues && Array.isArray(ourValues) ? ourValues.map(v => ({
      where: { id: v.id || 0 },
      update: { title: v.title, description: v.description },
      create: { title: v.title, description: v.description }
    })) : [];
    // Delete removed facts/values
    const existingFactIds = (existingAboutSection.factsAndFigures || []).map(f => f.id);
    const newFactIds = (factsAndFigures || []).map(f => f.id).filter(Boolean);
    const factsToDelete = existingFactIds.filter(id => !newFactIds.includes(id));
    const existingValueIds = (existingAboutSection.ourValues || []).map(v => v.id);
    const newValueIds = (ourValues || []).map(v => v.id).filter(Boolean);
    const valuesToDelete = existingValueIds.filter(id => !newValueIds.includes(id));
    // Update About section and nested relations
    const aboutSection = await prisma.about.update({
      where: { id: aboutId },
      data: {
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        image: imageUrl,
        factsAndFigures: {
          deleteMany: factsToDelete.length ? { id: { in: factsToDelete } } : undefined,
          upsert: factsToUpsert.length ? factsToUpsert : undefined
        },
        ourValues: {
          deleteMany: valuesToDelete.length ? { id: { in: valuesToDelete } } : undefined,
          upsert: valuesToUpsert.length ? valuesToUpsert : undefined
        }
      },
      include: { factsAndFigures: true, ourValues: true }
    });
    res.status(200).json({ success: true, message: "About section updated successfully", data: aboutSection });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update about section", error: error.message });
  }
};

// Delete about section
const deleteAboutSection = async (req, res) => {
  try {
    const { id } = req.params;
    const aboutId = parseInt(id);
    if (isNaN(aboutId)) {
      return res.status(400).json({ success: false, message: "Invalid about section ID" });
    }
    await prisma.about.delete({ where: { id: aboutId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete about section", error: error.message });
  }
};

module.exports = {
  getAboutSections,
  getAboutSectionById,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
}; 