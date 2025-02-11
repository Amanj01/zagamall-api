const prisma = require("../prisma");

// Create a new form
const createForm = async (req, res) => {
  try {
    const { name, description, fields } = req.body;

    const form = await prisma.form.create({
      data: {
        name,
        description,
        fields: {
          create: fields.map((field) => ({
            label: field.label,
            type: field.type,
            options: field.options,
            isRequired: field.isRequired,
          })),
        },
      },
    });

    res.status(201).json({ message: "Form created successfully", form });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a form response
const submitFormResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const fields = req.body;
    const files = req.files || [];

    // Create the form response
    const formResponse = await prisma.formResponse.create({
      data: {
        formId: parseInt(formId),
      },
    });

    // Save non-file responses
    for (const [fieldName, value] of Object.entries(fields)) {
      const fieldId = parseInt(fieldName.split("_")[1]);

      await prisma.formResponseData.create({
        data: {
          fieldId,
          value,
          responseId: formResponse.id,
        },
      });
    }

    // Save file responses
    for (const file of files) {
      const fieldId = parseInt(file.fieldname.split("_")[1]);

      await prisma.formResponseFile.create({
        data: {
          fieldId,
          filePath: `/uploads/${file.filename}`,
          responseId: formResponse.id,
        },
      });
    }

    res.status(201).json({ message: "Form response submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a form by ID
const getFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: { fields: true }, // Include the form fields
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all responses for a form
const getFormResponses = async (req, res) => {
  try {
    const { id } = req.params;

    const responses = await prisma.formResponse.findMany({
      where: { formId: parseInt(id) },
      include: {
        responses: true,
        files: true,
      },
    });

    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific response by ID
const getFormResponseById = async (req, res) => {
  try {
    const { id, responseId } = req.params;

    const response = await prisma.formResponse.findUnique({
      where: { id: parseInt(responseId) },
      include: {
        responses: true,
        files: true,
      },
    });

    if (!response || response.formId !== parseInt(id)) {
      return res.status(404).json({ message: "Response not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createForm,
  submitFormResponse,
  getFormById,
  getFormResponses,
  getFormResponseById,
};
