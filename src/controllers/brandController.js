const prisma = require("../prisma");
const { deleteCloudinaryImage, uploadToCloudinary, deleteFile } = require("../utils/utility");

// Get all brands with pagination, search, and meta
const getAllBrands = async (req, res) => {
  try {
    console.log('Brands API called with query:', req.query);
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
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    console.log('Counting brands with where clause:', whereClause);
    const totalCount = await prisma.brand.count({
      where: whereClause
    });
    console.log('Total count:', totalCount);

    // Get brands with pagination
    console.log('Fetching brands with params:', { whereClause, orderBy, skip, take: pageSize });
    const brands = await prisma.brand.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });
    console.log('Brands found:', brands.length, 'Requested pageSize:', pageSize);

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
      message: "Brands retrieved successfully",
      data: brands,
      meta,
      links
    });
  } catch (error) {
    console.error('Error in getAllBrands:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message
    });
  }
};

// Get a specific brand by ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new brand
const createBrand = async (req, res) => {
  try {
    console.log('=== Brand Creation Debug ===');
    console.log('req.body:', req.body);
    
    const { name, isShowInHome, image } = req.body;
    if (!name) {
      console.log('❌ Name is missing');
      return res.status(400).json({ error: "Name is required" });
    }
    
    if (!image) {
      console.log('❌ Image is missing');
      return res.status(400).json({ error: "Image is required" });
    }
    
    console.log('Creating brand with data:', {
      name,
      image,
      isShowInHome: isShowInHome === true || isShowInHome === "true"
    });
    
    const brand = await prisma.brand.create({
      data: {
        name,
        image,
        isShowInHome: isShowInHome === true || isShowInHome === "true",
      },
    });
    
    console.log('✅ Brand created successfully:', brand);
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    console.error('❌ Error creating brand:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isShowInHome, image } = req.body;
    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    
    // Handle image update
    let finalImage = existingBrand.image;
    if (image !== undefined) {
      if (image === '') {
        // User wants to remove the image
        if (existingBrand.image) {
          await deleteCloudinaryImage(existingBrand.image);
          console.log('🗑️ Existing Cloudinary image deleted');
        }
        finalImage = null;
      } else {
        // Update with new image
        finalImage = image;
      }
    }
    
    const updatedBrand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingBrand.name,
        image: finalImage,
        isShowInHome: isShowInHome !== undefined ? (isShowInHome === true || isShowInHome === "true") : existingBrand.isShowInHome,
      },
    });
    res.status(200).json({ message: "Brand updated successfully", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting brand with ID:', id);
    
    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Delete Cloudinary image if it exists
    if (existingBrand.image) {
      try {
        console.log('🗑️ Deleting Cloudinary image:', existingBrand.image);
        await deleteCloudinaryImage(existingBrand.image);
        console.log('✅ Cloudinary image deleted successfully');
      } catch (deleteError) {
        console.error('❌ Failed to delete Cloudinary image:', deleteError);
        // Continue with brand deletion even if image deletion fails
      }
    }

    // Delete the brand record
    await prisma.brand.delete({
      where: { id: parseInt(id) },
    });

    console.log('✅ Brand deleted successfully');
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
