const httpStatus = require('http-status');
const { sendSuccessResponse, sendErrorResponse, sendServerErrorResponse } = require('../helper/apiResponse.helper');
const { unpaidJobs, payToJob } = require('../service/job.service');

const getUnpaidJobs = async (req, res) =>{
    try {
        const queryParams = {
            profile_id : req.get("profile_id")
        };
        const unpaid = await unpaidJobs(queryParams); 
        return sendSuccessResponse(res, httpStatus.OK, unpaid);       
    } catch (error) {
        return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error);
    }
};

const payJobById = async (req, res) => {
    try {
        const queryParams = {
            client_id: req.profile.id,
            balance: req.profile.balance,
            job_id: req.params.job_id
        };
        const processPayment = await payToJob(queryParams);
        if (processPayment.success) {
            return sendSuccessResponse(res, httpStatus.OK, processPayment.message);
        } else {
            return sendErrorResponse(res, httpStatus.BAD_REQUEST, processPayment.message);
        }
    } catch (error) {
        return sendServerErrorResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error);
    }
}


module.exports = {getUnpaidJobs, payJobById}