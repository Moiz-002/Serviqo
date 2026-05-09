const express = require('express');
const { searchWorkers, getWorkerPublicProfile } = require('../controllers/worker');

const router = express.Router();

router.get('/', searchWorkers);
router.get('/:workerId', getWorkerPublicProfile);

module.exports = router;
