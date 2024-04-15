const httpStatus = require('http-status');
const { fetchBestProfession, fetchHighPayClient } = require('../service/admin.service');
const { sendSuccessResponse, sendServerErrorResponse } = require('../helper/apiResponse.helper');
const bestProfession = async(req, res) => {
    try {
        const queryParams = {
            start : req.query.start,
            end : req.query.end
        };
        const getBestProfession = await fetchBestProfession(queryParams);
        return sendSuccessResponse(res, httpStatus.OK, getBestProfession);        
    } catch (error) {
        return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error); 
    }
}

const bestClient = async(req, res) => {
    try {
        const queryParams = {
            start : req.query.start,
            end : req.query.end,
            pagination : {
                limit: req.query.limit || 2,
                offset: req.query.offset || 0,
            }
        }
        const highPayClient = await fetchHighPayClient(queryParams);
        return sendSuccessResponse(res, httpStatus.OK, highPayClient);       
    } catch (error) {
        return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error); 
    }
  }

module.exports = { bestProfession, bestClient }; 