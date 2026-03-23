const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Problem = require('../models/Problem');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const topics = await Topic.find().sort({ order: 1 }).lean();

    const counts = await Problem.aggregate([
      { $group: { _id: '$topicId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const result = topics.map((t) => ({
      ...t,
      problemCount: countMap[t._id.toString()] || 0,
    }));

    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid topic ID', 400);
    }

    const topic = await Topic.findById(req.params.id).lean();
    if (!topic) return sendError(res, 'Topic not found', 404);

    const problems = await Problem.find({ topicId: topic._id }).sort({ order: 1 }).lean();
    sendSuccess(res, { ...topic, problems });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, order } = req.body;
    if (!title || order === undefined) {
      return sendError(res, 'title and order are required', 400);
    }
    const topic = await Topic.create({ title, description, order });
    sendSuccess(res, topic, 201);
  } catch (err) {
    next(err);
  }
};
