const sendSuccessResponse = (res, httpStatus, data) => {
    res.status(httpStatus).json({
        success: true,
        data
    });
};

const sendErrorResponse = (res, httpStatus, message) => {
    res.status(httpStatus).json({
        success: false,
        error: {
            code : httpStatus,
            message
        }
    });
};

const sendServerErrorResponse = (res, httpStatus, error) => {
    res.status(httpStatus).json({
        success: false,
        error: {
            code: httpStatus,
            message: error.message
        }
    });
};

module.exports = { sendSuccessResponse, sendErrorResponse, sendServerErrorResponse };
