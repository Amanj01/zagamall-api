const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get about information
const getAbout = async (req, res) => {
  try {
    // Check if prisma client is properly initialized
    if (!prisma || !prisma.about) {
      return res.status(500).json({ 
        message: "Database connection error or 'about' model not available",
        error: "Make sure you've run 'npx prisma migrate dev' to update your database"
      });
    }

    const aboutInfo = await prisma.about.findFirst({
      include: {
        ourValues: true,
        factsAndFigures: true,
      },
    });

    if (!aboutInfo) {
      return res.status(404).json({ message: "About information not found" });
    }

    res.status(200).json(aboutInfo);
  } catch (error) {
    console.error("Error in getAbout:", error);
    res.status(500).json({ 
      error: error.message,
      hint: "Make sure you've run 'npx prisma migrate dev' to update your database with the new models"
    });
  }
};

// Create new about information
const createAbout = async (req, res) => {
  try {
    // Check if prisma client is properly initialized
    if (!prisma || !prisma.about) {
      return res.status(500).json({ 
        message: "Database connection error or 'about' model not available",
        error: "Make sure you've run 'npx prisma migrate dev' to update your database"
      });
    }

    const { title, description, ourValues, factsAndFigures } = req.body;
    
    // Parse JSON strings if they come as strings
    const parsedValues = ourValues && typeof ourValues === 'string' 
      ? JSON.parse(ourValues)
      : ourValues;
      
    const parsedFacts = factsAndFigures && typeof factsAndFigures === 'string'
      ? JSON.parse(factsAndFigures)
      : factsAndFigures;
    
    // Check if about info already exists
    const existingAbout = await prisma.about.findFirst();
    if (existingAbout) {
      return res.status(400).json({ 
        message: "About information already exists. Use PUT to update it."
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Create about with relations in a transaction
    const aboutInfo = await prisma.about.create({
      data: {
        title,
        description,
        image: imagePath,
        ourValues: {
          create: parsedValues && parsedValues.slice(0, 4).map(value => ({
            title: value.title,
            description: value.description,
          })),
        },
        factsAndFigures: {
          create: parsedFacts && parsedFacts.map(fact => ({
            number: fact.number,
            description: fact.description,
          })),
        },
      },
      include: {
        ourValues: true,
        factsAndFigures: true,
      },
    });

    res.status(201).json({
      message: "About information created successfully",
      about: aboutInfo,
    });
  } catch (error) {
    console.error("Error in createAbout:", error);
    res.status(500).json({ 
      error: error.message,
      hint: "Make sure you've run 'npx prisma migrate dev' to update your database with the new models"
    });
  }
};

// Update about information
const updateAbout = async (req, res) => {
  try {
    // Check if prisma client is properly initialized
    if (!prisma || !prisma.about) {
      return res.status(500).json({ 
        message: "Database connection error or 'about' model not available",
        error: "Make sure you've run 'npx prisma migrate dev' to update your database"
      });
    }
    
    const { title, description, ourValues, factsAndFigures } = req.body;
    
    // Parse JSON strings if they come as strings
    const parsedValues = ourValues && typeof ourValues === 'string' 
      ? JSON.parse(ourValues)
      : ourValues;
      
    const parsedFacts = factsAndFigures && typeof factsAndFigures === 'string'
      ? JSON.parse(factsAndFigures)
      : factsAndFigures;

    // Find existing about info
    const existingAbout = await prisma.about.findFirst();
    if (!existingAbout) {
      return res.status(404).json({ message: "About information not found" });
    }

    const imagePath = req.file 
      ? `/uploads/${req.file.filename}` 
      : existingAbout.image;

    // Update in a transaction
    const updatedAbout = await prisma.$transaction(async (prisma) => {
      // Delete existing relations
      if (parsedValues) {
        await prisma.ourValue.deleteMany({
          where: { aboutId: existingAbout.id },
        });
      }
      
      if (parsedFacts) {
        await prisma.factAndFigure.deleteMany({
          where: { aboutId: existingAbout.id },
        });
      }

      // Update the main about record
      const updatedAboutInfo = await prisma.about.update({
        where: { id: existingAbout.id },
        data: {
          title: title || existingAbout.title,
          description: description || existingAbout.description,
          image: imagePath,
          ...(parsedValues && {
            ourValues: {
              create: parsedValues.slice(0, 4).map(value => ({
                title: value.title,
                description: value.description,
              })),
            }
          }),
          ...(parsedFacts && {
            factsAndFigures: {
              create: parsedFacts.map(fact => ({
                number: fact.number,
                description: fact.description,
              })),
            }
          }),
        },
        include: {
          ourValues: true,
          factsAndFigures: true,
        },
      });

      return updatedAboutInfo;
    });

    // Clean up old image if new one was uploaded
    if (req.file && existingAbout.image) {
      deleteFile(existingAbout.image);
    }

    res.status(200).json({
      message: "About information updated successfully",
      about: updatedAbout,
    });
  } catch (error) {
    console.error("Error in updateAbout:", error);
    res.status(500).json({ 
      error: error.message,
      hint: "Make sure you've run 'npx prisma migrate dev' to update your database with the new models"
    });
  }
};

// Delete about information
const deleteAbout = async (req, res) => {
  try {
    // Check if prisma client is properly initialized
    if (!prisma || !prisma.about) {
      return res.status(500).json({ 
        message: "Database connection error or 'about' model not available",
        error: "Make sure you've run 'npx prisma migrate dev' to update your database"
      });
    }
    
    const existingAbout = await prisma.about.findFirst();
    
    if (!existingAbout) {
      return res.status(404).json({ message: "About information not found" });
    }

    // Cascading delete will handle related records
    await prisma.about.delete({
      where: { id: existingAbout.id },
    });

    // Clean up image if exists
    if (existingAbout.image) {
      deleteFile(existingAbout.image);
    }

    res.status(200).json({ message: "About information deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAbout:", error);
    res.status(500).json({ 
      error: error.message,
      hint: "Make sure you've run 'npx prisma migrate dev' to update your database with the new models"
    });
  }
};

module.exports = {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
};
