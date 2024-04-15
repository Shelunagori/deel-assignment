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

app.get('/admin/best-profession', async(req, res) => {
    const { Job, Contract, Profile } = req.app.get('models');
    const { start, end } = req.query;
    const bestProfession = await Profile.findAll({
        attributes : [
            'profession',
            [sequelize.fn("SUM", sequelize.col("price")), "earned"]
        ],
        include:[
            {
                model: Contract,
                as: 'Contractor',
                required: true,
                attributes: [],
                include: [
                    {
                        model: Job,
                        required:true,
                        attributes: [],
                        where : {
                            paymentDate: {
                                [Op.between]: [start, end]
                            },
                            paid : true
                        }
                    }
                ]
            }
        ],
        where : {
            type : 'contractor'
        },
        group : ['profession'],
        order: [[sequelize.col('earned'), 'DESC']],
        limit: 1,
        subQuery: false,
    });
    res.json(bestProfession);
});

app.get('/admin/best-clients', async(req, res) => {
    const { Job, Contract, Profile } = req.app.get('models');
    const { start, end, limit } = req.query;
    const pagination = {
        limit: limit || 2,
        offset: 0,
    };
    const highPayClient = await Job.findAll({
        attributes: [
          [sequelize.col("Contract.Client.id"), "id"],
          [sequelize.literal("firstName || ' ' || lastName"), "fullName"],
          [sequelize.fn("sum", sequelize.col("Job.price")), "paid"],
        ],
        include: [
          {
            model: Contract,
            as: 'Contract',
            attributes: [],
            include: [
              {
                model: Profile,
                as: 'Client',
                attributes: [],
              },
            ],
          },
        ],
        where: {
          paid: true,
          paymentDate: {
            [Op.between]: [start, end],
          },
        },
        group: ["Contract.Client.id"],
        order: [["id", "ASC"]],
        raw: true,
        limit: pagination.limit,
        offset: pagination.offset,
    });
    return res.json(highPayClient);
});

app.post("/balances/deposit/:userId", async(req, res) => {
    const { Contract, Job, Profile } = req.app.get("models");
    const clientId = req.params.userId;
    const depositAmount = req.body.amount;
    const depositTransaction = await sequelize.transaction();
    try {
        const client = await Profile.findByPk(clientId, { transaction: depositTransaction });
        const unpaidJobsAmount = await Job.findOne({
            attributes : [
                [sequelize.fn("SUM", sequelize.col("price")), "totalPrice"]
            ],
            where : {
                [Op.or]: [{ paid: false }, { paid: null }],
            },
            include : [
                {
                    model : Contract,
                    require : true,
                    where : {
                        ClientId: clientId,
                        status : 'in_progress'
                    }
                }
            ],
            raw: true,
            group: ["Contract.ClientId"],
        });
    
       const { totalPrice } = unpaidJobsAmount;
       const depositLimit = totalPrice * 0.25;
    
       if(depositAmount > depositLimit) {
            return res.json(response = `Maximum deposit amount reached. Deposit ${depositAmount} is more than 25% of client ${clientId} total of jobs to pay`);
       }        
       await client.increment({ balance: depositAmount }, { transaction: depositTransaction });
       client.balance += depositAmount;
       await depositTransaction.commit();
       return res.json(client);
    } catch (error) {
       await depositTransaction.rollback();
       return res.json(error);
    }
});
module.exports = app;
