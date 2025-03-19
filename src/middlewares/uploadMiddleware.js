const multer = require("multer");
const path = require("path");

const uploadPath = path.join(__dirname, "../assets/uploads/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //cb(null, "./src/assets/uploads/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

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

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PDFs, videos, and images are allowed.")
    );
  }
};

// Create Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
