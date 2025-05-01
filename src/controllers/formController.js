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

    const formResponse = await prisma.formResponse.create({
      data: {
        form: {
          connect: { id: parseInt(id) },
        },
      },
    });

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: { fields: true },
    });

    const emailFieldId = form.fields.find(
      (field) => field.label == "Email"
    )?.id;

    let email = "";

    // Save non-file responses
    for (const [fieldName, value] of Object.entries(fields)) {
      const fieldId = parseInt(fieldName.split("_")[1]);

      if (fieldId === emailFieldId) {
        email = value;
      }
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

    console.log(email);

    await emailService.sendFormSubmittedEmail(email, "");
    res.status(201).json({ message: "Form response submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a form by ID
const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization;

    const form = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: { fields: true }, // Include the form fields
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (!form.active && !token) {
      return res.status(404).json({ message: "Form is not active" });
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

    // Split email list into chunks of 50 and send emails in batches
    const chunkSize = 50;
    for (let i = 0; i < emailList.length; i += chunkSize) {
      const emailChunk = emailList.slice(i, i + chunkSize);
      await emailService.sendEmailToMultipleUsers(emailChunk, subject, content);
    }

    return res.status(200).json({
      message: "Emails sent successfully",
      emails: emailList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a form by ID
const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active, fields } = req.body;

    const existingForm = await prisma.form.findUnique({
      where: { id: parseInt(id) },
      include: { fields: true },
    });

    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    await prisma.form.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        active: active === "true",
      },
    });

    if (fields && Array.isArray(fields)) {
      const existingFieldIds = existingForm.fields.map((field) =>
        field.id.toString()
      );

      const incomingFieldIds = fields
        .filter(
          (field) => typeof field?.id !== "undefined" && field.id !== null
        )
        .map((field) => field.id.toString());

      const fieldsToDelete = existingFieldIds.filter(
        (id) => !incomingFieldIds.includes(id)
      );

      if (fieldsToDelete.length > 0) {
        await prisma.formField.deleteMany({
          where: {
            id: {
              in: fieldsToDelete.map((id) => parseInt(id)),
            },
          },
        });
      }

      for (const field of fields) {
        if (field?.id) {
          await prisma.formField.update({
            where: { id: parseInt(field.id) },
            data: {
              label: field.label,
              type: field.type,
              options: field.options,
              isRequired: field.isRequired === "true",
            },
          });
        } else {
          await prisma.formField.create({
            data: {
              formId: parseInt(id),
              label: field.label,
              type: field.type,
              options: field.options,
              isRequired: field.isRequired === "true",
            },
          });
        }
      }
    }
    res.status(200).json({
      message: "Form updated successfully",
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
  updateForm,
};
