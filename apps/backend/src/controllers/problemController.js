const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { sendSuccess, sendError } = require('../utils/response');

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.topicId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.topicId)) {
        return sendError(res, 'Invalid topicId', 400);
      }
      filter.topicId = req.query.topicId;
    }

    if (req.query.difficulty) {
      if (!VALID_DIFFICULTIES.includes(req.query.difficulty)) {
        return sendError(res, `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`, 400);
      }
      filter.difficulty = req.query.difficulty;
    }

    const problems = await Problem.find(filter).sort({ topicId: 1, order: 1 }).lean();
    sendSuccess(res, problems);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid problem ID', 400);
    }

    const problem = await Problem.findById(req.params.id).lean();
    if (!problem) return sendError(res, 'Problem not found', 404);
    sendSuccess(res, problem);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { topicId, title, difficulty, ytLink, leetcodeLink, articleLink, order } = req.body;

    if (!topicId || !title || !difficulty || order === undefined) {
      return sendError(res, 'topicId, title, difficulty, and order are required', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return sendError(res, 'Invalid topicId', 400);
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return sendError(res, `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`, 400);
    }

    const problem = await Problem.create({ topicId, title, difficulty, ytLink, leetcodeLink, articleLink, order });
    sendSuccess(res, problem, 201);
  } catch (err) {
    next(err);
  }
};
