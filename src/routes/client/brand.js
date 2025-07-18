const express = require("express");
const { getAllBrands, getBrandById } = require("../../controllers/brandController");
const prisma = require("../../prisma");
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { name, isShowInHome, page = 1, limit = 10 } = req.query;
    const where = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (isShowInHome !== undefined) where.isShowInHome = isShowInHome === 'true' || isShowInHome === true;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const brands = await prisma.brand.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
    res.json({ data: brands });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands', error });
  }
});
router.get("/:id", getBrandById);

module.exports = router; 