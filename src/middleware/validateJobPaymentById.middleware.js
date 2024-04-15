const { body, param, validationResult } = require('express-validator');
const httpStatus = require('http-status');

const validateJobPaymentById = [
    param('job_id').notEmpty().isNumeric().toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {validateJobPaymentById};
