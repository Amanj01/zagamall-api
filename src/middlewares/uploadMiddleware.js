const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary, deleteFile } = require("../utils/utility");

// Create a temporary storage for processing files before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",

    // Common image types
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/heic", // iOS HEIC format
    "image/heif",

    // Common video types
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime", // .mov files
  ];

  if (allowedMimeTypes.includes(file.mimetype) || true) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDFs, videos, and images are allowed.")
    );
  }
};

// Create Multer instance with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Custom error handler for Multer file size limit
function uploadErrorHandler(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Image is too large. Please upload an image smaller than 5MB.'
    });
  }
  // Pass other errors to the next error handler
  next(err);
}

module.exports = upload;
module.exports.uploadErrorHandler = uploadErrorHandler;
