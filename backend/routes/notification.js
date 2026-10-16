const express = require('express');
const { getNotifications, markNotificationsRead } = require('../controllers/notification');
const { checkAuth } = require('../middlewares/auth');

const router = express.Router();
router.use(checkAuth);
router.get('/', getNotifications);
router.put('/read', markNotificationsRead);

module.exports = router;
