const { param, validationResult } = require('express-validator');
const httpStatus = require('http-status');
const validateContractsById = [
    param('id').notEmpty().isString().trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {validateContractsById};