const express = require('express');
const { postReview, getWorkerReviews, getMyReviews } = require('../controllers/review');
const { checkAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/worker/:workerId', getWorkerReviews);

router.use(checkAuth);

router.post('/', postReview);
router.get('/mine', getMyReviews);

module.exports = router;
