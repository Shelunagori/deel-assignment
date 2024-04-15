const Sequelize = require('sequelize');
const sequelize = require('../config/db');

class Contract extends Sequelize.Model {}

Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

module.exports = Contract;
