const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const geoip = require("geoip-lite"); // To resolve IP location

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (templateName, to, subject, data) => {
  try {
    // Render the specific template first
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.ejs`
    );
    const content = await ejs.renderFile(templatePath, data);

    // Render the base template with the content injected
    const baseTemplatePath = path.join(
      __dirname,
      "templates",
      "baseTemplate.ejs"
    );
    const htmlContent = await ejs.renderFile(baseTemplatePath, { content });

    const cleanEmails = Array.isArray(to)
      ? to.map((e) => e.trim())
      : [to.trim()];

    const emailOptions = {
      from: `"Snow Company" <${process.env.EMAIL_USER}>`,
      bcc: cleanEmails,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(emailOptions);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

// Send email to multiple users privately (BCC)
const sendEmailToMultiple = async (templateName, recipients, subject, data) => {
  try {
    return await sendEmail(templateName, recipients, subject, {
      ...data,
    });
  } catch (err) {
    console.error("Error sending email to multiple users:", err);
    throw err;
  }
};

module.exports = {
  // Reset password email
  sendResetPasswordEmail: (to, name, resetLink) =>
    sendEmail("resetPassword", to, "Reset Your Password", {
      name,
      resetLink,
    }),

  // Form submission confirmation email
  sendFormSubmittedEmail: (to, name) =>
    sendEmail("formSubmitted", to, "Form Submitted Successfully", {
      name,
    }),

  // Generic email
  sendGenericEmail: (to, subject, content) =>
    sendEmail("generic", to, subject, { content }),

  // Email to multiple users (private recipients)
  sendEmailToMultipleUsers: (recipients, subject, content) =>
    sendEmailToMultiple("generic", recipients, subject, { content }),

  // New login email
  sendNewLoginEmail: async (to, name, ip) => {
    const location = geoip.lookup(ip);
    const locationDetails = location
      ? `${location.city}, ${location.region}, ${location.country}`
      : "Unknown Location";

    return sendEmail("newLogin", to, "New Login Detected", {
      name,
      ip,
      location: locationDetails,
    });
  },

  // Password changed email
  sendPasswordChangedEmail: (to, name) =>
    sendEmail("passwordChanged", to, "Your Password Has Been Changed", {
      name,
    }),
};
