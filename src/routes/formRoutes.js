const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  createForm,
  submitFormResponse,
  getFormById,
  getFormResponseById,
} = require("../controllers/formController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

// Get all forms
router.get(
  "/",
  paginationMiddleware("form", [], {
    include: { responses: true, fields: true },
  })
);

// Create a new form
router.post("/", upload.none(), createForm);

// Submit a form response
router.post("/:id/response", upload.any(), submitFormResponse);

// Get a form by ID
router.get("/:id", getFormById);

// Get all responses for a form
router.get(
  "/:formId/responses",
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
          fullResponse[field.label] = filePath;
        });
        return fullResponse;
      });
    }
  )
);

// Get a specific response by ID
router.get("/:id/responses/:responseId", getFormResponseById);

module.exports = router;
