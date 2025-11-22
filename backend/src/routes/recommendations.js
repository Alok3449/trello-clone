const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

router.use(auth);

router.get('/:boardId', recommendationController.getRecommendations);

module.exports = router;