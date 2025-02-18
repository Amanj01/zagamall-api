const prisma = require("../prisma");

// Add a new comment for a specific brand
const createComment = async (req, res) => {
  try {
    const { name, review, showOnHomepage, brandId } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        name,
        review,
        showOnHomepage: showOnHomepage === "true",
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { name, review, showOnHomepage, brandId } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        name,
        review,
        showOnHomepage: showOnHomepage === "true",
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  createComment,
  updateComment,
  getCommentById,
};
