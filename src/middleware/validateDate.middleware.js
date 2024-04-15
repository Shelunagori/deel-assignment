const { query, validationResult } = require('express-validator');
const httpStatus = require('http-status');
const validateDateParams = [
    query("start").notEmpty().withMessage('Start date is required').isISO8601().toDate(),
    query("end").notEmpty().withMessage('End date is required').isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateDateParams };
