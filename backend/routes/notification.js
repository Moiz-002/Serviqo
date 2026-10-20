const express = require('express');
const {
  getNotifications,
  markNotificationsRead,
  markNotificationRead,
  deleteNotification,
  registerNotificationDevice,
  removeNotificationDevice,
} = require('../controllers/notification');
const { checkAuth } = require('../middlewares/auth');

const router = express.Router();
router.use(checkAuth);
router.get('/', getNotifications);
router.post('/device-token', registerNotificationDevice);
router.delete('/device-token', removeNotificationDevice);
router.put('/read', markNotificationsRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

module.exports = router;
