const express = require("express");
const jobRoutes = express.Router();
const { getProfile } = require("../middleware/getProfile.middleware");
const {validateJobPaymentById} = require("../middleware/validateJobPaymentById.middleware");
const jobController = require("../controller/job.controller");

jobRoutes.get("/unpaid", getProfile, jobController.getUnpaidJobs);

jobRoutes.post("/:job_id/pay", getProfile, validateJobPaymentById, jobController.payJobById);

module.exports = jobRoutes;
