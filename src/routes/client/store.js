const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /client/store - Get stores with optional filtering and meta
router.get('/', async (req, res) => {
  try {
    const { name, search, isShowInHome, page = 1, limit = 10 } = req.query;
    const where = {};
    // Support both 'name' and 'search' parameters for backward compatibility
    const searchTerm = search || name;
    if (searchTerm) where.name = { contains: searchTerm, mode: 'insensitive' };
    if (isShowInHome !== undefined) where.isShowInHome = isShowInHome === 'true' || isShowInHome === true;
    

    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const stores = await prisma.store.findMany({ 
      where, 
      skip, 
      take, 
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        location: true
      }
    });
    const total = await prisma.store.count({ where });
    

    
    // Only send public fields
    const publicStores = stores.map(({ id, name, description, category, location, isShowInHome, imagePath }) => ({
      id, name, description, category, location, isShowInHome, imagePath
    }));
    const responseData = {
      data: publicStores,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    

    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /client/store/:id - Get single store (public fields only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true
      }
    });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    // Only send public fields
    const { name, description, category, location, isShowInHome, imagePath } = store;
    res.json({ id, name, description, category, location, isShowInHome, imagePath });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 