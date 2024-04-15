const { Op } = require("sequelize");
const sequelize = require("../config/db");
const { Profile, Contract, Job } = require("../model/index");

const fetchBestProfession = async ({ start, end }) => {
  try {
    return await Profile.findAll({
      attributes: [
        "profession",
        [sequelize.fn("SUM", sequelize.col("price")), "earned"],
      ],
      include: [
        {
          model: Contract,
          as: "Contractor",
          required: true,
          attributes: [],
          include: [
            {
              model: Job,
              required: true,
              attributes: [],
              where: {
                paymentDate: {
                  [Op.between]: [start, end],
                },
                paid: true,
              },
            },
          ],
        },
      ],
      where: {
        type: "contractor",
      },
      group: ["profession"],
      order: [[sequelize.col("earned"), "DESC"]],
      limit: 1,
      subQuery: false,
    });
  } catch (error) {
    const errorMessage = "Failed to fetch best Profession.";
    throw new Error(`${errorMessage} ${error.message}`);
  }
};

const fetchHighPayClient = async ({ start, end, pagination }) => {
  try {
    return await Job.findAll({
      attributes: [
        [sequelize.col("Contract.Client.id"), "id"],
        [sequelize.literal("firstName || ' ' || lastName"), "fullName"],
        [sequelize.fn("sum", sequelize.col("Job.price")), "paid"],
      ],
      include: [
        {
          model: Contract,
          as: "Contract",
          attributes: [],
          include: [
            {
              model: Profile,
              as: "Client",
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
  } catch (error) {
    const errorMessage = "Failed to fetch high paying clients.";
    throw new Error(`${errorMessage} ${error.message}`);
  }
};

module.exports = { fetchBestProfession, fetchHighPayClient };
