const express = require('express');
const { createDispute, getDisputes } = require('../controllers/admin');
const { checkAuth } = require('../middlewares/auth');
const Dispute = require('../models/Dispute');

const router = express.Router();

router.use(checkAuth);

router.post('/', createDispute);

router.get('/mine', async (req, res) => {
  const disputes = await Dispute.find({
    $or: [{ raisedBy: req.user._id }, { against: req.user._id }],
  })
    .populate('job', 'title status')
    .populate('raisedBy', 'name role')
    .populate('against', 'name role')
    .sort({ createdAt: -1 });

  return res.json({ disputes });
});

module.exports = router;
