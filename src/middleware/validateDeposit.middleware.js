const { body, param, validationResult } = require('express-validator');
const httpStatus = require('http-status');

const {getProfileById} = require("../helper/getProfile.helper");
const { sendErrorResponse } = require('../helper/apiResponse.helper');

const validateDeposit = [
    param('userId').notEmpty().isNumeric().trim().escape(),
    body('amount').notEmpty().isNumeric().toFloat(),
    async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }

        const profileId = req.params.userId;
        if (!profileId) {
            return sendErrorResponse(res,httpStatus.BAD_REQUEST, 'Profile ID is missing') 
        }

        const profile = await getProfileById(profileId);        
        if (!profile) {
            return sendErrorResponse(res,httpStatus.UNAUTHORIZED, 'UNAUTHORIZED Profile')            
        }
        if(profile.type === 'contractor') {
            return sendErrorResponse(res,httpStatus.UNAUTHORIZED, 'No Client Profile Found')
        }        
        next();
    }
];

module.exports = {validateDeposit};