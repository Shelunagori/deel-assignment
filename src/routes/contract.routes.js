const express = require("express");
const contractController = require("../controller/contract.controller");
const { getProfile } = require("../middleware/getProfile.middleware");
const {
  validateContractsById,
} = require("../middleware/validateContractsById.middleware");
const contractRoutes = express.Router();

contractRoutes.get(
  "/:id",
  getProfile,
  validateContractsById,
  contractController.getContractsByID
);
contractRoutes.get("/", getProfile, contractController.getContracts);
module.exports = contractRoutes;
