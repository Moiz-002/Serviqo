const express = require('express');
const { getConversations, getOrCreateConversation, getMessages, sendMessage } = require('../controllers/message');
const { checkAuth } = require('../middlewares/auth');

const router = express.Router();

router.use(checkAuth);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId', getMessages);
router.post('/conversations/:conversationId', sendMessage);

module.exports = router;
