const prisma = require("../prisma");
const { deleteCloudinaryImage, uploadToCloudinary, deleteFile } = require("../utils/utility");

// Get all stores with pagination, search, and meta
const getAllStores = async (req, res) => {
  try {
    console.log('Stores API called with query:', req.query);
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
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    console.log('Counting stores with where clause:', whereClause);
    const totalCount = await prisma.store.count({
      where: whereClause
    });
    console.log('Total count:', totalCount);

    // Get stores with pagination
    console.log('Fetching stores with params:', { whereClause, orderBy, skip, take: pageSize });
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        category: true,
        location: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });
    console.log('Stores found:', stores.length, 'Requested pageSize:', pageSize);

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
      message: "Stores retrieved successfully",
      data: stores,
      meta,
      links
    });
  } catch (error) {
    console.error('Error in getAllStores:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message
    });
  }
};

// Get a specific store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new store
const createStore = async (req, res) => {
  try {
    console.log('=== Store Creation Debug ===');
    console.log('req.body:', req.body);
    
    const { name, categoryId, locationId, description, isShowInHome, imagePath } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    if (!categoryId) {
      return res.status(400).json({ error: "Category is required" });
    }
    
    if (!locationId) {
      return res.status(400).json({ error: "Location is required" });
    }
    
    if (!imagePath) {
      return res.status(400).json({ error: "Image is required" });
    }
    
    console.log('Creating store with data:', {
      name,
      categoryId: parseInt(categoryId),
      locationId: parseInt(locationId),
      description,
      imagePath,
      isShowInHome: isShowInHome === true || isShowInHome === "true"
    });
    
    const store = await prisma.store.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        locationId: parseInt(locationId),
        description,
        imagePath,
        isShowInHome: isShowInHome === true || isShowInHome === "true",
      },
      include: {
        category: true,
        location: true,
      },
    });
    
    console.log('✅ Store created successfully:', store);
    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    console.error('❌ Error creating store:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, locationId, description, isShowInHome, imagePath } = req.body;
    
    console.log('=== Store Update Debug ===');
    console.log('req.body:', req.body);
    
    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    // Handle image update
    let finalImagePath = existingStore.imagePath;
    if (imagePath !== undefined) {
      if (imagePath === '') {
        // User wants to remove the image
        if (existingStore.imagePath) {
          await deleteCloudinaryImage(existingStore.imagePath);
          console.log('🗑️ Existing Cloudinary image deleted');
        }
        finalImagePath = null;
      } else {
        // Update with new image
        finalImagePath = imagePath;
      }
    }
    
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingStore.name,
        categoryId: categoryId ? parseInt(categoryId) : existingStore.categoryId,
        locationId: locationId ? parseInt(locationId) : existingStore.locationId,
        description: description || existingStore.description,
        imagePath: finalImagePath,
        isShowInHome: isShowInHome !== undefined ? (isShowInHome === true || isShowInHome === "true") : existingStore.isShowInHome,
      },
      include: {
        category: true,
        location: true,
      },
    });
    
    console.log('✅ Store updated successfully:', updatedStore);
    res.status(200).json({ message: "Store updated successfully", store: updatedStore });
  } catch (error) {
    console.error('❌ Error updating store:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
};
