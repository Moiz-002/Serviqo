const express = require('express');
const { submitBid, getJobBids, getMyBids, acceptBid, rejectBid } = require('../controllers/bid');
const { checkAuth, checkRole } = require('../middlewares/auth');

const router = express.Router();

router.use(checkAuth);

router.post('/', checkRole('worker'), submitBid);
router.get('/mine', checkRole('worker'), getMyBids);
router.get('/job/:jobId', checkRole('customer', 'admin'), getJobBids);
router.put('/:bidId/accept', checkRole('customer'), acceptBid);
router.put('/:bidId/reject', checkRole('customer'), rejectBid);

module.exports = router;
