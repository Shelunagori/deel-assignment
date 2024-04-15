const express = require("express");
const { header, query } = require("express-validator");
const { validateDateParams } = require("../middleware/validateDate.middleware");
const adminController = require("../controller/admin.controller");

const adminRoutes = express.Router();

adminRoutes.get(
  "/best-profession",
  validateDateParams,
  adminController.bestProfession
);

adminRoutes.get(
  "/best-clients",
  validateDateParams,
  adminController.bestClient
);

module.exports = adminRoutes;
