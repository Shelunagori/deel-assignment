const { Op } = require("sequelize");
const sequelize = require('../config/db');
const { Job, Contract, Profile } = require("../model/index");

const unpaidJobs = async ({ profile_id }) => {
  try {
    return await Job.findAll({
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
  } catch (error) {
    const errorMessage = "Failed to fetch unpaid jobs.";
    throw new Error(`${errorMessage} ${error.message}`); 
  }
};

const payToJob = async ({ job_id, client_id, balance }) => {
    const jobDetail = await Job.findOne({
        where: {
            id: job_id,
        },
        include: [
            {
                model: Contract,
                require: true,
                where: {
                    ClientId: client_id,
                    status: "in_progress",
                },
            },
        ],
    });

    if (jobDetail) {
        if(jobDetail.paid) {
          return { success: false, message: 'No due payments'};
        }
        const amountToBePaid = jobDetail.price;
        const contractorId = jobDetail.Contract.ContractorId;
        
        if (balance >= amountToBePaid) {
          const paymentTransaction = await sequelize.transaction();
            try {
                await Promise.all([
                    Profile.update(
                        { balance: sequelize.literal(`balance - ${amountToBePaid}`) },
                        { where: { id: client_id, type: "client" }, lock: true, transaction: paymentTransaction }
                    ),

                    Profile.update(
                        { balance: sequelize.literal(`balance + ${amountToBePaid}`) },
                        { where: { id: contractorId, type: "contractor" }, lock: true, transaction: paymentTransaction }
                    ),

                    Job.update(
                        { paid: 1, paymentDate: new Date() },
                        { where: { id: job_id }, lock: true, transaction: paymentTransaction }
                    ),
                ]);
                await paymentTransaction.commit();
                return { success: true, message: `Transaction of ${amountToBePaid} has been made successfully.`, data: null };
            } catch (error) {
              console.log(error.message)
                await paymentTransaction.rollback();
                return { success: false, message: `Transaction of ${amountToBePaid} has been failed, please try again`, data: null };
            }
        } else {
            return { success: false, message: 'Insufficient funds', data: null };
        }
    } else {
        return { success: false, message: 'Job not found', data: null };
    }
};
module.exports = { unpaidJobs, payToJob };