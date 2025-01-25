const prisma = require("../prisma");
const { generateResetPasswordToken, verifyToken } = require("../utils/jwt");
const emailService = require("../email/emailService");
const { isBeforeHoursAgo } = require("../utils/utility");
const bcrypt = require("bcrypt");

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No accounts with this email exist" });
    }

    const token = generateResetPasswordToken(user);
    emailService.sendResetPasswordEmail(
      user.email,
      user.username,
      `https://snow.com/resetPassword?token=${token}`
    );

    await prisma.passwordTokens.create({
      data: {
        token,
      },
    });
    res
      .status(200)
      .json({ message: "An email sent with the reset password link" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.query.token;

    const requestToken = await prisma.passwordTokens.findUnique({
      where: { token },
    });
    if (!requestToken) {
      return res
        .status(404)
        .json({ message: "No reset password request for this account exists" });
    }
    if (isBeforeHoursAgo(requestToken.createdAt, 2)) {
      await prisma.passwordTokens.delete({
        where: { id: parseInt(requestToken.id) },
      });
      return res
        .status(404)
        .json({ message: "The request password link is expired" });
    }

    const userDetail = verifyToken(token);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: parseInt(userDetail.id) },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordTokens.delete({
      where: { id: parseInt(requestToken.id) },
    });
    res.status(200).json({
      message: "Password reseted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkRequestToken = async (req, res) => {
  try {
    const token = req.query.token;

    const requestToken = await prisma.passwordTokens.findUnique({
      where: { token },
    });
    return res.status(200).json({
      isValid: !!requestToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
  checkRequestToken,
};
