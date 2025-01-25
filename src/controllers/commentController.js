const prisma = require("../prisma");

// Get all comments for a specific brand
const getComments = async (req, res) => {
  try {
    const { brandId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { brandId: parseInt(brandId) },
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new comment for a specific brand
const createComment = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { name, review, showOnHomepage } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        name,
        review,
        showOnHomepage: showOnHomepage === "true",
        brandId: parseInt(brandId),
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
    const { brandId, commentId } = req.params;
    const { name, review, showOnHomepage } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment || existingComment.brandId !== parseInt(brandId)) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        name,
        review,
        showOnHomepage: showOnHomepage === "true",
      },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific comment
const deleteComment = async (req, res) => {
  try {
    const { brandId, commentId } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment || existingComment.brandId !== parseInt(brandId)) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
