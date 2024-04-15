const { Op } = require("sequelize");
const sequelize = require("../config/db");
const { Job, Contract, Profile } = require("../model/index");

const saveAmount = async ({ clientId, depositAmount }) => { 
  const depositTransaction = await sequelize.transaction();
  try {
    const client = await Profile.findByPk(clientId, {
      transaction: depositTransaction,
    });
    const unpaidJobsAmount = await Job.findOne({
      attributes: [[sequelize.fn("SUM", sequelize.col("price")), "totalPrice"]],
      where: {
        [Op.or]: [{ paid: false }, { paid: null }],
      },
      include: [
        {
          model: Contract,
          require: true,
          where: {
            ClientId: clientId,
            status: "in_progress",
          },
        },
      ],
      raw: true,
      group: ["Contract.ClientId"],
    });

    if (unpaidJobsAmount === null) {
      return { success: false, message: `No unpaid jobs found` };
    }

    const { totalPrice } = unpaidJobsAmount;
    const depositLimit = totalPrice * 0.25;

    if (depositAmount > depositLimit) {
      return {
        success: false,
        message: `Maximum deposit amount reached. Deposit ${depositAmount} is more than 25% of client ${clientId} total of jobs to pay`,
      };
    }

    await client.increment(
      { balance: depositAmount },
      { transaction: depositTransaction }
    );
    client.balance += depositAmount;
    await depositTransaction.commit();
    return { success: true, message: client };
  } catch (error) {
    await depositTransaction.rollback();
    return {
      success: false,
      message: `Failed to deposit amount: ${error.message}`,
    };
  }
};

module.exports = { saveAmount };
