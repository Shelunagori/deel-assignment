const httpStatus = require('http-status');
const {saveAmount} = require("../service/balance.service");
const { sendSuccessResponse, sendErrorResponse, sendServerErrorResponse } = require('../helper/apiResponse.helper');
const depositAmount = async(req, res) => {
    try {
        const parameters = {
            clientId : req.params.userId,
            depositAmount : req.body.amount
        }
        const depositJobAmount = await saveAmount(parameters);        
        if (depositJobAmount.success) {
            return sendSuccessResponse(res, httpStatus.OK, depositJobAmount.message);
        } else {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, depositJobAmount.message);
        }        
    } catch (error) {
        return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error);
    }
}

module.exports = {depositAmount};