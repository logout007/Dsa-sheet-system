const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, upsert, stats } = require('../controllers/progressController');

router.get('/stats', auth, stats);
router.get('/', auth, getAll);
router.post('/', auth, upsert);

module.exports = router;
