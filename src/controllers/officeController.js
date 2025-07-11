const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_SORT_FIELDS = ["createdAt", "title", "area"];

/**
 * Utility: Parse and validate query params for pagination, sorting, and filtering.
 * @param {object} query
 * @returns {object}
 */
function parseQueryParams(query) {
  const page = Math.max(parseInt(query.page) || DEFAULT_PAGE, 1);
  const pageSize = Math.max(parseInt(query.pageSize) || DEFAULT_PAGE_SIZE, 1);
  const sortBy = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
  const order = query.order === "desc" ? "desc" : "asc";
  return { page, pageSize, sortBy, order };
}

/**
 * Utility: Build dynamic where clause for search/filter.
 * Supports partial/case-insensitive search on title, features, and description.
 * @param {object} query
 * @returns {object}
 */
function buildOfficeWhere(query) {
  const where = {};
  if (query.title) {
    where.title = { contains: query.title, mode: "insensitive" };
  }
  if (query.features) {
    where.features = { contains: query.features, mode: "insensitive" };
  }
  if (query.description) {
    where.description = { contains: query.description, mode: "insensitive" };
  }
  if (query.locationId) {
    where.locationId = parseInt(query.locationId);
  }
  if (query.area) {
    where.area = parseInt(query.area);
  }
  return where;
}

/**
 * GET /offices - List offices with pagination, search, and filter.
 * @route GET /offices
 */
const listOffices = async (req, res) => {
  try {
    const { page, pageSize, sortBy, order } = parseQueryParams(req.query);
    const where = buildOfficeWhere(req.query);

    const [total, offices] = await Promise.all([
      prisma.office.count({ where }),
      prisma.office.findMany({
        where,
        include: { location: true, gallery: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: order },
      })
    ]);

    return res.status(200).json({
      status: "success",
      data: offices,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      error: null
    });
  } catch (error) {
    console.error("[OfficeController] listOffices error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to fetch offices", details: error.message }
    });
  }
};

/**
 * GET /offices/:id - Get office by ID.
 * @route GET /offices/:id
 */
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;
    const office = await prisma.office.findUnique({
      where: { id: parseInt(id) },
      include: { location: true, gallery: true },
    });
    if (!office) {
      return res.status(404).json({
        status: "error",
        data: null,
        meta: null,
        error: { message: "Office not found" }
      });
    }
    return res.status(200).json({
      status: "success",
      data: office,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[OfficeController] getOfficeById error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to fetch office", details: error.message }
    });
  }
};

/**
 * Validate office input for create/update.
 * @param {object} body
 * @returns {object|null} error
 */
function validateOfficeInput(body) {
  const requiredFields = ["title", "locationId", "description", "area"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return { message: `Field '${field}' is required.` };
    }
  }
  if (isNaN(Number(body.area))) {
    return { message: "Area must be a number." };
  }
  return null;
}

/**
 * POST /offices - Create office.
 * @route POST /offices
 */
const createOffice = async (req, res) => {
  try {
    const error = validateOfficeInput(req.body);
    if (error) {
      return res.status(400).json({ status: "error", data: null, meta: null, error });
    }
    const { title, locationId, description, area, image, gallery } = req.body;
    // image: Cloudinary URL string
    // gallery: array of Cloudinary URL strings
    let galleryImages = [];
    if (Array.isArray(gallery)) {
      galleryImages = gallery.map(url => ({ imagePath: url }));
    }
    const office = await prisma.office.create({
      data: {
        title,
        locationId: parseInt(locationId),
        description,
        area: parseInt(area),
        image,
        gallery: { create: galleryImages },
      },
      include: { location: true, gallery: true },
    });
    return res.status(201).json({
      status: "success",
      data: office,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[OfficeController] createOffice error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to create office", details: error.message }
    });
  }
};

/**
 * PUT /offices/:id - Update office.
 * @route PUT /offices/:id
 */
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const error = validateOfficeInput(req.body);
    if (error) {
      return res.status(400).json({ status: "error", data: null, meta: null, error });
    }
    const { title, locationId, description, area, image, gallery } = req.body;
    const existingOffice = await prisma.office.findUnique({ where: { id: parseInt(id) }, include: { gallery: true } });
    if (!existingOffice) {
      return res.status(404).json({
        status: "error",
        data: null,
        meta: null,
        error: { message: "Office not found" }
      });
    }
    // Delete old Cloudinary image if image is changing
    if (image && image !== existingOffice.image && existingOffice.image) {
      await deleteCloudinaryImage(existingOffice.image);
    }
    // Delete removed gallery images from Cloudinary
    if (Array.isArray(gallery)) {
      const oldGallery = existingOffice.gallery.map(g => g.imagePath);
      const removed = oldGallery.filter(url => !gallery.includes(url));
      for (const url of removed) {
        await deleteCloudinaryImage(url);
      }
      // Remove old gallery images from DB
      await prisma.officeGallery.deleteMany({ where: { officeId: parseInt(id), imagePath: { in: removed } } });
      // Add new gallery images
      const newImages = gallery.filter(url => !oldGallery.includes(url)).map(url => ({ imagePath: url, officeId: parseInt(id) }));
      if (newImages.length > 0) {
        await prisma.officeGallery.createMany({ data: newImages });
      }
    }
    const updatedOffice = await prisma.office.update({
      where: { id: parseInt(id) },
      data: {
        title,
        locationId: parseInt(locationId),
        description,
        area: parseInt(area),
        image,
      },
      include: { location: true, gallery: true },
    });
    return res.status(200).json({
      status: "success",
      data: updatedOffice,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[OfficeController] updateOffice error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to update office", details: error.message }
    });
  }
};

/**
 * DELETE /offices/:id - Delete office and gallery.
 * @route DELETE /offices/:id
 */
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const office = await prisma.office.findUnique({ where: { id: parseInt(id) }, include: { gallery: true } });
    if (!office) {
      return res.status(404).json({
        status: "error",
        data: null,
        meta: null,
        error: { message: "Office not found" }
      });
    }
    for (const img of office.gallery) {
      if (img.imagePath) await deleteCloudinaryImage(img.imagePath);
    }
    if (office.image) await deleteCloudinaryImage(office.image);
    await prisma.officeGallery.deleteMany({ where: { officeId: office.id } });
    await prisma.office.delete({ where: { id: office.id } });
    return res.status(200).json({
      status: "success",
      data: null,
      meta: null,
      error: null,
      message: "Office deleted successfully"
    });
  } catch (error) {
    console.error("[OfficeController] deleteOffice error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to delete office", details: error.message }
    });
  }
};

/**
 * DELETE /offices/gallery/:id - Delete a gallery image.
 * @route DELETE /offices/gallery/:id
 */
const deleteOfficeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryImage = await prisma.officeGallery.findUnique({ where: { id: parseInt(id) } });
    if (!galleryImage) {
      return res.status(404).json({
        status: "error",
        data: null,
        meta: null,
        error: { message: "Gallery image not found" }
      });
    }
    if (galleryImage.imagePath) await deleteCloudinaryImage(galleryImage.imagePath);
    await prisma.officeGallery.delete({ where: { id: galleryImage.id } });
    return res.status(200).json({
      status: "success",
      data: null,
      meta: null,
      error: null,
      message: "Gallery image deleted successfully"
    });
  } catch (error) {
    console.error("[OfficeController] deleteOfficeGalleryImage error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to delete gallery image", details: error.message }
    });
  }
};

// TODO: Add advanced filtering, role-based access, and bulk operations as needed.

module.exports = {
  listOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
  deleteOfficeGalleryImage,
}; 