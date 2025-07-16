const prisma = require("../prisma");
const emailService = require("../email/emailService");

// Get all contact inquiries with pagination
const getAllContactInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNumber = parseInt(page);
    const limit = parseInt(pageSize);
    const skip = (pageNumber - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.contactInquiry.count();

    // Get inquiries with pagination
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip: skip,
      take: limit,
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    // Build meta information
    const meta = {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      pageSize: limit,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      previousPage: hasPreviousPage ? pageNumber - 1 : null
    };

    res.status(200).json({
      success: true,
      message: "Contact inquiries retrieved successfully",
      data: inquiries,
      meta
    });
  } catch (error) {
    console.error('Error in getAllContactInquiries:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch contact inquiries",
      error: error.message 
    });
  }
};

// Get contact inquiry by ID
const getContactInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: parseInt(id) },
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Contact inquiry not found" });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a contact inquiry
const submitContactInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        updatedAt: new Date()
      },
    });

    // Optionally send notification email to admin
    try {
      const adminEmail = process.env.EMAIL_USER || 'admin@example.com';
      await emailService.sendGenericEmail(
        adminEmail,
        `New Contact Inquiry: ${subject}`,
        `New contact inquiry from ${name} (${email}): ${message}`
      );
      console.log("Admin notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError.message);
      // Continue with response, don't fail if email sending fails
    }

    res.status(201).json({ 
      message: "Your inquiry has been submitted successfully", 
      inquiry 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update contact inquiry
const updateContactInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existingInquiry = await prisma.contactInquiry.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInquiry) {
      return res.status(404).json({ message: "Contact inquiry not found" });
    }

    const updatedInquiry = await prisma.contactInquiry.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNotes,
      },
    });

    res.status(200).json({
      message: "Contact inquiry updated successfully",
      inquiry: updatedInquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllContactInquiries,
  getContactInquiryById,
  submitContactInquiry,
  updateContactInquiry,
};
