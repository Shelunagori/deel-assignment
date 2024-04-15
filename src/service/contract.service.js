const { Op } = require("sequelize");
const { Contract } = require("../model/index");

const fetchContractsById = async ({ profile_id, contract_id }) => {
  try {
    return await Contract.findOne({
      where: {
        id: contract_id,
        [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
      },
    });    
  } catch (error) {
    const errorMessage = "Failed to fetch contracts by ID.";
    throw new Error(`${errorMessage} ${error.message}`);  
  }
};

const fetchActiveContracts = async ({ profile_id }) => {
  try {
    return await Contract.findAll({
      where: {
        status: { [Op.ne]: "terminated" },
        [Op.or]: [{ ClientId: profile_id }, { ContractorId: profile_id }],
      },
    });    
  } catch (error) {
    const errorMessage = "Failed to fetch active contracts";
    throw new Error(`${errorMessage} ${error.message}`);  
  }
};

module.exports = { fetchContractsById, fetchActiveContracts };
