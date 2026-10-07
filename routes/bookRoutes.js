const router = require('express').Router();
const bookController = require('../controllers/bookController');

router.get('/', bookController.list);
router.post('/books', bookController.create);

module.exports = router;
