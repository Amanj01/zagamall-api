const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  createForm,
  submitFormResponse,
  getFormById,
  getFormResponses,
  getFormResponseById,
} = require("../controllers/formController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

// Get all forms
router.get("/", paginationMiddleware("form"));

// Create a new form
router.post("/", createForm);

// Submit a form response
router.post("/:id/responses", upload.any(), submitFormResponse);

// Get a form by ID
router.get("/:id", getFormById);

// Get all responses for a form
router.get("/:id/responses", getFormResponses);

// Get a specific response by ID
router.get("/:id/responses/:responseId", getFormResponseById);

module.exports = router;
