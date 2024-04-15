const express = require("express");
const balanceRoutes = express.Router();
const { validateDeposit } = require("../middleware/validateDeposit.middleware");
const {depositAmount} = require("../controller/balance.controller");
balanceRoutes.post("/deposit/:userId", validateDeposit, depositAmount);

module.exports = balanceRoutes;