const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get home settings
const getHomeSettings = async (req, res) => {
  try {
    const settings = await prisma.homeSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      return res.status(404).json({ message: "Home settings not found" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get homepage with featured content
const getHomepage = async (req, res) => {
  try {
    const [settings, featuredStores, featuredEvents, featuredBrands] = await Promise.all([
      prisma.homeSetting.findFirst({
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.store.findMany({
        where: { isShowInHome: true },
      }),
      prisma.event.findMany({
        where: { isShowInHome: true },
      }),
      prisma.brand.findMany({
        where: { isShowInHome: true },
      }),
    ]);

    res.status(200).json({
      stores: featuredStores,
      events: featuredEvents,
      brands: featuredBrands,
      quickInfo: {
        title: settings?.quickInfoTitle,
        content: settings?.quickInfoContent
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create home settings
const createHomeSettings = async (req, res) => {
  try {
    const { quickInfoTitle, quickInfoContent } = req.body;
    
    const existingSettings = await prisma.homeSetting.findFirst();
    
    if (existingSettings) {
      return res.status(400).json({ 
        message: "Home settings already exist. Use PUT to update them." 
      });
    }

    const settings = await prisma.homeSetting.create({
      data: {
        quickInfoTitle,
        quickInfoContent
      }
    });

    res.status(201).json({ 
      message: "Home settings created successfully", 
      settings 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update home settings
const updateHomeSettings = async (req, res) => {
  try {
    const { quickInfoTitle, quickInfoContent } = req.body;

    const existingSettings = await prisma.homeSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    let updatedSettings;

    if (existingSettings) {
      updatedSettings = await prisma.homeSetting.update({
        where: { id: existingSettings.id },
        data: {
          quickInfoTitle,
          quickInfoContent
        }
      });
    } else {
      updatedSettings = await prisma.homeSetting.create({
        data: {
          quickInfoTitle,
          quickInfoContent
        }
      });
    }

    res.status(200).json({
      message: "Home settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete home settings
const deleteHomeSettings = async (req, res) => {
  try {
    const settings = await prisma.homeSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      return res.status(404).json({ message: "Home settings not found" });
    }

    await prisma.homeSetting.delete({
      where: { id: settings.id },
    });

    res.status(200).json({ message: "Home settings deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHomeSettings,
  updateHomeSettings,
  getHomepage,
  createHomeSettings,
  deleteHomeSettings
};
