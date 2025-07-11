const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

// Constants
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_SORT_FIELDS = ["createdAt", "title", "area"];

function parseQueryParams(query) {
  const page = Math.max(parseInt(query.page) || DEFAULT_PAGE, 1);
  const pageSize = Math.max(parseInt(query.pageSize) || DEFAULT_PAGE_SIZE, 1);
  const sortBy = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
  const order = query.order === "desc" ? "desc" : "asc";
  return { page, pageSize, sortBy, order };
}

function buildWhere(query) {
  const where = {};
  if (query.title) {
    where.title = { contains: query.title, mode: "insensitive" };
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

const listEntertainmentAndSports = async (req, res) => {
  try {
    const { page, pageSize, sortBy, order } = parseQueryParams(req.query);
    const where = buildWhere(req.query);
    const [total, items] = await Promise.all([
      prisma.entertainmentAndSport.count({ where }),
      prisma.entertainmentAndSport.findMany({
        where,
        include: { location: true, gallery: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: order },
      })
    ]);
    return res.status(200).json({
      status: "success",
      data: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      error: null
    });
  } catch (error) {
    console.error("[EntertainmentAndSportController] list error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to fetch items", details: error.message }
    });
  }
};

const getEntertainmentAndSportById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.entertainmentAndSport.findUnique({
      where: { id: parseInt(id) },
      include: { location: true, gallery: true },
    });
    if (!item) {
      return res.status(404).json({
        status: "error",
        data: null,
        meta: null,
        error: { message: "Not found" }
      });
    }
    return res.status(200).json({
      status: "success",
      data: item,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[EntertainmentAndSportController] getById error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to fetch item", details: error.message }
    });
  }
};

function validateInput(body) {
  const requiredFields = ["title", "locationId", "description"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return { message: `Field '${field}' is required.` };
    }
  }
  return null;
}

const createEntertainmentAndSport = async (req, res) => {
  try {
    const error = validateInput(req.body);
    if (error) {
      return res.status(400).json({ status: "error", data: null, meta: null, error });
    }
    const { title, locationId, description, area, gallery } = req.body;
    // gallery: array of Cloudinary URL strings
    let galleryImages = [];
    if (Array.isArray(gallery)) {
      galleryImages = gallery.map(url => ({ imagePath: url }));
    }
    const item = await prisma.entertainmentAndSport.create({
      data: {
        title,
        locationId: parseInt(locationId),
        description,
        area: area ? parseInt(area) : null,
        gallery: { create: galleryImages },
      },
      include: { location: true, gallery: true },
    });
    return res.status(201).json({
      status: "success",
      data: item,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[EntertainmentAndSportController] create error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to create item", details: error.message }
    });
  }
};

const updateEntertainmentAndSport = async (req, res) => {
  try {
    const { id } = req.params;
    const error = validateInput(req.body);
    if (error) {
      return res.status(400).json({ status: "error", data: null, meta: null, error });
    }
    const { title, locationId, description, area, gallery } = req.body;
    const existing = await prisma.entertainmentAndSport.findUnique({ where: { id: parseInt(id) }, include: { gallery: true } });
    if (!existing) {
      return res.status(404).json({ status: "error", data: null, meta: null, error: { message: "Not found" } });
    }
    // Delete removed gallery images from Cloudinary
    if (Array.isArray(gallery)) {
      const oldGallery = existing.gallery.map(g => g.imagePath);
      const removed = oldGallery.filter(url => !gallery.includes(url));
      for (const url of removed) {
        await deleteCloudinaryImage(url);
      }
      // Remove old gallery images from DB
      await prisma.entertainmentAndSportGallery.deleteMany({ where: { entertainmentAndSportId: parseInt(id), imagePath: { in: removed } } });
      // Add new gallery images
      const newImages = gallery.filter(url => !oldGallery.includes(url)).map(url => ({ imagePath: url, entertainmentAndSportId: parseInt(id) }));
      if (newImages.length > 0) {
        await prisma.entertainmentAndSportGallery.createMany({ data: newImages });
      }
    }
    const updated = await prisma.entertainmentAndSport.update({
      where: { id: parseInt(id) },
      data: {
        title,
        locationId: parseInt(locationId),
        description,
        area: area ? parseInt(area) : null,
      },
      include: { location: true, gallery: true },
    });
    return res.status(200).json({
      status: "success",
      data: updated,
      meta: null,
      error: null
    });
  } catch (error) {
    console.error("[EntertainmentAndSportController] update error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to update item", details: error.message }
    });
  }
};

const deleteEntertainmentAndSport = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.entertainmentAndSport.findUnique({ where: { id: parseInt(id) }, include: { gallery: true } });
    if (!item) {
      return res.status(404).json({ status: "error", data: null, meta: null, error: { message: "Not found" } });
    }
    for (const img of item.gallery) {
      if (img.imagePath) await deleteCloudinaryImage(img.imagePath);
    }
    await prisma.entertainmentAndSportGallery.deleteMany({ where: { entertainmentAndSportId: item.id } });
    await prisma.entertainmentAndSport.delete({ where: { id: item.id } });
    return res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (error) {
    console.error("[EntertainmentAndSportController] delete error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to delete item", details: error.message }
    });
  }
};

const deleteEntertainmentAndSportGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryImage = await prisma.entertainmentAndSportGallery.findUnique({ where: { id: parseInt(id) } });
    if (!galleryImage) {
      return res.status(404).json({ status: "error", data: null, meta: null, error: { message: "Gallery image not found" } });
    }
    if (galleryImage.imagePath) await deleteCloudinaryImage(galleryImage.imagePath);
    await prisma.entertainmentAndSportGallery.delete({ where: { id: galleryImage.id } });
    return res.status(200).json({ status: "success", message: "Gallery image deleted successfully" });
  } catch (error) {
    console.error("[EntertainmentAndSportController] deleteGalleryImage error:", error);
    return res.status(500).json({
      status: "error",
      data: null,
      meta: null,
      error: { message: "Failed to delete gallery image", details: error.message }
    });
  }
};

module.exports = {
  listEntertainmentAndSports,
  getEntertainmentAndSportById,
  createEntertainmentAndSport,
  updateEntertainmentAndSport,
  deleteEntertainmentAndSport,
  deleteEntertainmentAndSportGalleryImage,
}; 