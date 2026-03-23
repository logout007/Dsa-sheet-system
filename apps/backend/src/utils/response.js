const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message, data: null });
};

module.exports = { sendSuccess, sendError };
