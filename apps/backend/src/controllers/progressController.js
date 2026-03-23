const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');
require('../models/Topic');    // register model for aggregation $lookup
require('../models/Problem');  // register model for aggregation $lookup
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const progress = await UserProgress.find({ userId: req.user.id }).lean();
    sendSuccess(res, progress);
  } catch (err) {
    next(err);
  }
};

exports.upsert = async (req, res, next) => {
  try {
    const { problemId, completed } = req.body;

    if (!problemId) return sendError(res, 'problemId is required', 400);
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return sendError(res, 'Invalid problemId', 400);
    }
    if (typeof completed !== 'boolean') {
      return sendError(res, 'completed must be a boolean', 400);
    }

    const doc = await UserProgress.findOneAndUpdate(
      { userId: req.user.id, problemId },
      { completed, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    sendSuccess(res, doc);
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Start from all topics so topics with 0 progress still appear with correct totals
    const stats = await mongoose.model('Topic').aggregate([
      { $sort: { order: 1 } },
      // Get all problems for this topic
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: 'topicId',
          as: 'problems',
        },
      },
      // Only include topics that have at least one problem
      { $match: { 'problems.0': { $exists: true } } },
      // Get this user's progress records for problems in this topic
      {
        $lookup: {
          from: 'userprogresses',
          let: { problemIds: '$problems._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$problemId', '$$problemIds'] },
                    { $eq: ['$userId', userId] },
                    { $eq: ['$completed', true] },
                  ],
                },
              },
            },
          ],
          as: 'completedDocs',
        },
      },
      {
        $project: {
          _id: 0,
          topicId: '$_id',
          topicTitle: '$title',
          total: { $size: '$problems' },
          completed: { $size: '$completedDocs' },
          percentage: {
            $cond: [
              { $eq: [{ $size: '$problems' }, 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $size: '$completedDocs' }, { $size: '$problems' }] },
                      100,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    ]);

    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};
