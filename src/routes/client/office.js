const express = require("express");
const { getOffices, getOfficeById } = require("../../controllers/officeController");
const router = express.Router();

router.get("/", getOffices);
router.get("/:id", getOfficeById);

module.exports = router; 