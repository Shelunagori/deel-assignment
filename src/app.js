const express = require("express");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const profile_id = req.get("profile_id");
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      id: id,
      [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

app.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const profile_id = req.get("profile_id");
  const contract = await Contract.findAll({
    where: {
      status: { [Op.ne]: "terminated" },
      [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

app.get("/jobs/unpaid", async (req, res) => {
  const { Contract, Job } = req.app.get("models");
  const profile_id = req.get("profile_id");
  const unpaid = await Job.findAll({
    where: {
      [Op.or]: [{ paid: false }, { paid: null }],
    },
    include: [
      {
        model: Contract,
        required: true,
        where: {
          status: "in_progress",
          [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
        },
      },
    ],
  });

  if (!unpaid) return res.status(404).end();
  res.json(unpaid);
});

app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { id, balance } = req.profile;
  const jobId = req.params.job_id;
  //get job details

  const jobDetail = await Job.findOne({
    where: {
      id: jobId,
      [Op.or]: [{ paid: false }, { paid: null }],
    },
    include: [
      {
        model: Contract,
        require: true,
        where: {
          ClientId: id,
          status: "in_progress",
        },
      },
    ],
  });

  if (jobDetail) {
    const amountToBePaid = jobDetail.price;
    const contractorId = jobDetail.Contract.ContractorId;

    if (balance >= amountToBePaid) {
      const paymentTransaction = await sequelize.transaction();
      try {
        await Promise.all([
          Profile.update(
            { balance: sequelize.literal(`balance - ${amountToBePaid}`) },
            { where: { id, type: "client" }, transaction: paymentTransaction }
          ),

          Profile.update(
            { balance: sequelize.literal(`balance + ${amountToBePaid}`) },
            {
              where: { id: contractorId, type: "contractor" },
              transaction: paymentTransaction,
            }
          ),

          Job.update(
            { paid: 1, paymentDate: new Date() },
            { where: { id: jobId }, transaction: paymentTransaction }
          ),
        ]);
        await paymentTransaction.commit();
        return res.json(
          `Transaction of ${amountToBePaid} has been made successfully.`
        );
      } catch (error) {
        await paymentTransaction.rollback();
        return res.json(
          `Transaction of ${amountToBePaid} has been failed, please try again`
        );
      }
    } else {
      return res.json(`Insufficient funds`);
    }
  } else {
    return res.json(`Job not found`);
  }
});

module.exports = app;
