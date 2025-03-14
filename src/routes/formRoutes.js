const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  createForm,
  submitFormResponse,
  getFormById,
  getFormResponseById,
  sendEmailById,
} = require("../controllers/formController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get all forms
router.get(
  "/",
  protect,
  paginationMiddleware("form", [], {
    include: { responses: true, fields: true },
  })
);

// Create a new form
router.post("/", protect, upload.none(), createForm);

// Submit a form response
router.post("/:id/response", upload.any(), submitFormResponse);

// Get a form by ID
router.get("/:id", getFormById);

// Get all responses for a form
router.get(
  "/:formId/responses",
  protect,
  paginationMiddleware(
    "formResponse",
    ["formId"],
    {
      omit: { id: true, formId: true, createdAt: true },
      include: {
        responses: { include: { field: { select: { label: true } } } },
        files: { include: { field: { select: { label: true } } } },
      },
    },
    (responses) => {
      return responses.map((data) => {
        const { responses, files } = data;
        const fullResponse = {};
        responses.forEach(({ field, value }) => {
          fullResponse[field.label] = value;
        });
        files.forEach(({ field, filePath }) => {
          fullResponse[field.label] = process.env.ASSET_URL + filePath;
        });
        return fullResponse;
      });
    }
  )
);

router.post("/:id/mail", protect, upload.none(), sendEmailById);

// Get a specific response by ID
router.get("/:id/responses/:responseId", protect, getFormResponseById);

module.exports = router;
