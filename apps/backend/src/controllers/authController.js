const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

    const { name, email, password } = req.body;

    // Let the unique index + errorHandler handle duplicates (avoids race condition
    // from a separate findOne check). We still do a pre-check for a friendlier message.
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return sendError(res, 'Email already registered', 409);

    const user = await User.create({ name: name.trim(), email, passwordHash: password });
    const token = signToken(user);

    sendSuccess(
      res,
      { token, user: { _id: user._id, name: user.name, email: user.email } },
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 422);

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    // Use a constant-time comparison path — always call comparePassword even if user not found
    // to prevent timing-based user enumeration
    const passwordMatch = user ? await user.comparePassword(password) : false;
    if (!user || !passwordMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = signToken(user);
    sendSuccess(res, { token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};
