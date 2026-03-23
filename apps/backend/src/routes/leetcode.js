const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProblem } = require('../controllers/leetcodeController');

// GET /api/v1/leetcode/problem?slug=two-sum
router.get('/problem', auth, getProblem);

module.exports = router;
