const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get a specific blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
      include: { gallery: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new blog
const createBlog = async (req, res) => {
  try {
    const { title, content, showOnHomepage } = req.body;

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        showOnHomepage: showOnHomepage === "true",
        coverImage: `/uploads/${req.files.coverImage[0].filename}`,
      },
    });

    const gelleryFiles = req.files.gallery || [];
    if (gelleryFiles.length > 0) {
      await Promise.all(
        gelleryFiles.map((file) =>
          prisma.blogGallery.create({
            data: {
              imagePath: `/uploads/${file.filename}`,
              blog: {
                connect: { id: parseInt(blog.id) },
              },
            },
          })
        )
      );
    }

    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, showOnHomepage } = req.body;

    const existingBlog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newCoverImage = req.files.coverImage
      ? req.files?.coverImage[0].filename
      : undefined;
    const coverImage = newCoverImage
      ? `/uploads/${newCoverImage}`
      : existingBlog.coverImage;

    const updatedBlog = await prisma.blog
      .update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          showOnHomepage: showOnHomepage === "true",
          coverImage,
        },
      })
      .then((data) => {
        if (newCoverImage) deleteFile(existingBlog.coverImage);
        return data;
      });

    // Handle image uploads for gallery
    const gelleryFiles = req.files.gallery || [];
    if (gelleryFiles.length > 0) {
      await Promise.all(
        gelleryFiles.map((file) =>
          prisma.blogGallery.create({
            data: {
              imagePath: `/uploads/${file.filename}`,
              blog: {
                connect: { id: parseInt(id) },
              },
            },
          })
        )
      );
    }

    res.status(200).json({ message: "Blog updated successfully", updatedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBlogById,
  createBlog,
  updateBlog,
};
