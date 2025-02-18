const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  requestPasswordReset,
  resetPassword,
  checkRequestToken,
} = require("../controllers/resetPasswordController");

const router = express.Router();

router.post("/request", upload.none(), requestPasswordReset);

router.post("/reset", upload.none(), resetPassword);
router.post("/valid", upload.none(), checkRequestToken);

module.exports = router;
