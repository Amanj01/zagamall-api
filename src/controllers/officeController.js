const prisma = require("../prisma");
const { deleteFile, deleteCloudinaryImage, uploadToCloudinary } = require("../utils/utility");

// Get all offices with pagination, search, and meta
const getOffices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc"
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

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.office.count({
      where: whereClause
    });

    // Get offices with pagination
    const offices = await prisma.office.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
      include: {
        location: true,
        gallery: true
      }
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
      message: "Offices retrieved successfully",
      data: offices,
      meta,
      links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch offices",
      error: error.message
    });
  }
};

// Get single office by ID
const getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;
    const officeId = parseInt(id);

    if (isNaN(officeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID"
      });
    }

    const office = await prisma.office.findUnique({
      where: { id: officeId },
      include: {
        location: true,
        gallery: true
      }
    });

    if (!office) {
      return res.status(404).json({
        success: false,
        message: "Office not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Office retrieved successfully",
      data: office
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch office",
      error: error.message
    });
  }
};

// Create new office
const createOffice = async (req, res) => {
  try {
    const { title, description, locationId, area, image, gallery } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Description is required and cannot be empty"
      });
    }

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }

    if (!area || isNaN(parseInt(area)) || parseInt(area) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Area must be a positive number"
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters"
      });
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: parseInt(locationId) }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Selected location not found"
      });
    }

    // Check if title already exists
    const existingOfficeWithTitle = await prisma.office.findFirst({
      where: { title: { equals: title.trim(), mode: 'insensitive' } }
    });

    if (existingOfficeWithTitle) {
      return res.status(409).json({
        success: false,
        message: "An office with this title already exists"
      });
    }

    // Prepare gallery data
    let galleryData = [];
    if (req.files && req.files['gallery']) {
      for (const file of req.files['gallery']) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'offices/gallery');
          galleryData.push({ imagePath: url });
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload gallery image',
            error: err.message
          });
        }
      }
    } else if (gallery && Array.isArray(gallery)) {
      // fallback for direct URLs
      galleryData = gallery.map(imagePath => ({ imagePath }));
    }

    // Upload cover image to Cloudinary if present
    let coverImageUrl = null;
    if (req.files && req.files['image'] && req.files['image'][0]) {
      try {
        coverImageUrl = await uploadToCloudinary(req.files['image'][0].buffer, 'offices/cover');
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload cover image',
          error: err.message
        });
      }
    }

    const office = await prisma.office.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        locationId: parseInt(locationId),
        area: parseInt(area),
        image: coverImageUrl,
        gallery: {
          create: galleryData
        }
      },
      include: {
        location: true,
        gallery: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Office created successfully",
      data: office
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "An office with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create office",
      error: error.message
    });
  }
};

// Update office
const updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const officeId = parseInt(id);
    const { title, description, locationId, area, image, gallery, existingImage } = req.body;
    


    if (isNaN(officeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID"
      });
    }

    // Check if office exists
    const existingOffice = await prisma.office.findUnique({
      where: { id: officeId },
      include: {
        location: true,
        gallery: true
      }
    });

    if (!existingOffice) {
      return res.status(404).json({
        success: false,
        message: "Office not found"
      });
    }

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Description is required and cannot be empty"
      });
    }

    if (!locationId) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }

    if (!area || isNaN(parseInt(area)) || parseInt(area) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Area must be a positive number"
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 2000 characters"
      });
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: parseInt(locationId) }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Selected location not found"
      });
    }

    // Check if title already exists (excluding current office)
    const existingOfficeWithTitle = await prisma.office.findFirst({
      where: { 
        title: { equals: title.trim(), mode: 'insensitive' },
        id: { not: officeId }
      }
    });

    if (existingOfficeWithTitle) {
      return res.status(409).json({
        success: false,
        message: "An office with this title already exists"
      });
    }

    // Upload new cover image to Cloudinary if present
    let newCoverImageUrl = null;
    if (req.files && req.files['image'] && req.files['image'][0]) {
      try {
        newCoverImageUrl = await uploadToCloudinary(req.files['image'][0].buffer, 'offices/cover');
        // Delete old Cloudinary image if different
        if (existingOffice.image && existingOffice.image !== newCoverImageUrl) {
          await deleteCloudinaryImage(existingOffice.image);
        }
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload cover image',
          error: err.message
        });
      }
    } else if (existingImage !== undefined && !req.files?.image) {
      // If no new image uploaded but existing image info is provided
      if (existingImage === '') {
        // User wants to remove the image
        if (existingOffice.image) {
          await deleteCloudinaryImage(existingOffice.image);
        }
        newCoverImageUrl = null;
      } else if (existingImage) {
        // Preserve existing image
        newCoverImageUrl = existingImage;
      }
    }

    // Handle gallery updates
    if (req.files && req.files['gallery']) {
      // Upload new files to Cloudinary
      for (const file of req.files['gallery']) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'offices/gallery');
          await prisma.officeGallery.create({ data: { imagePath: url, officeId } });
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload gallery image',
            error: err.message
          });
        }
      }
    }
    if (gallery && Array.isArray(gallery)) {
      // Delete removed gallery images from Cloudinary
      const oldGallery = existingOffice.gallery.map(g => g.imagePath);
      const removed = oldGallery.filter(url => !gallery.includes(url));
      for (const url of removed) {
        await deleteCloudinaryImage(url);
      }
      // Remove old gallery images from DB
      await prisma.officeGallery.deleteMany({ 
        where: { 
          officeId: officeId,
          imagePath: { in: removed }
        } 
      });
      // Add new gallery images from URLs (if any)
      const newImages = gallery
        .filter(url => !oldGallery.includes(url))
        .map(url => ({ imagePath: url, officeId: officeId }));
      if (newImages.length > 0) {
        await prisma.officeGallery.createMany({ data: newImages });
      }
    }

    const updatedOffice = await prisma.office.update({
      where: { id: officeId },
      data: {
        title: title.trim(),
        description: description.trim(),
        locationId: parseInt(locationId),
        area: parseInt(area),
        image: newCoverImageUrl !== null ? newCoverImageUrl : (existingImage !== undefined && existingImage !== '' ? existingImage : null)
      },
      include: {
        location: true,
        gallery: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Office updated successfully",
      data: updatedOffice
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "An office with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update office",
      error: error.message
    });
  }
};

// Delete office
const deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const officeId = parseInt(id);

    if (isNaN(officeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid office ID"
      });
    }

    // Check if office exists
    const existingOffice = await prisma.office.findUnique({
      where: { id: officeId },
      include: {
        gallery: true
      }
    });

    if (!existingOffice) {
      return res.status(404).json({
        success: false,
        message: "Office not found"
      });
    }

    // Delete images from Cloudinary
    if (existingOffice.image) {
      await deleteCloudinaryImage(existingOffice.image);
    }

    // Delete gallery images from Cloudinary
    for (const galleryItem of existingOffice.gallery) {
      await deleteCloudinaryImage(galleryItem.imagePath);
    }

    // Delete office (gallery will be deleted automatically due to cascade)
    await prisma.office.delete({
      where: { id: officeId }
    });

    res.status(200).json({
      success: true,
      message: "Office deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete office",
      error: error.message
    });
  }
};

// Delete gallery image
const deleteOfficeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imageIdInt = parseInt(id);

    if (isNaN(imageIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID"
      });
    }

    // Check if gallery image exists
    const galleryImage = await prisma.officeGallery.findUnique({
      where: { id: imageIdInt },
      include: {
        office: true
      }
    });

    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found"
      });
    }

    // Delete image from Cloudinary
    await deleteCloudinaryImage(galleryImage.imagePath);

    // Delete from database
    await prisma.officeGallery.delete({
      where: { id: imageIdInt }
    });

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
      error: error.message
    });
  }
};

module.exports = {
  getOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
  deleteOfficeGalleryImage
}; 