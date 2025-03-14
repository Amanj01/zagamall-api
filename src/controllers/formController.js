const emailService = require("../email/emailService");
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
            isRequired: field.isRequired === "true",
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
    const { id } = req.params;
    const fields = req.body;
    const files = req.files || [];

    // Create the form response
    const formResponse = await prisma.formResponse.create({
      data: {
        form: {
          connect: { id: parseInt(id) },
        },
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

const sendEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content } = req.body;

    const response = await prisma.formResponse.findMany({
      where: { formId: parseInt(id) },
      omit: { id: true, formId: true, createdAt: true },
      include: {
        responses: {
          include: {
            field: { select: { type: true } },
          },
        },
      },
    });

    if (!response.length) {
      return res.status(400).json({ message: "There are no responses yet" });
    }

    const emailList = [];

    response.forEach((resp) => {
      resp.responses.forEach((r) => {
        if (r.field?.type === "email" && r.value) {
          emailList.push(r.value);
        }
      });
    });

    if (!emailList.length) {
      return res
        .status(400)
        .json({ message: "The form does not have an email field" });
    }

    await emailService.sendEmailToMultipleUsers(emailList, subject, content);

    return res.status(200).json({
      message: "Emails sent successfully",
      emails: emailList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createForm,
  submitFormResponse,
  getFormById,
  getFormResponseById,
  sendEmailById,
};
