const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) return sendError(res, 'Unauthorized', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Guard against malformed payloads missing expected fields
    if (!decoded.id || !decoded.email) {
      return sendError(res, 'Invalid token payload', 401);
    }
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};
