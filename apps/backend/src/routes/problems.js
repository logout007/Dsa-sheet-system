const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, getOne, create } = require('../controllers/problemController');

router.get('/', auth, getAll);
router.get('/:id', auth, getOne);
router.post('/', auth, create);

module.exports = router;
