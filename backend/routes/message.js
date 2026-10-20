const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { getConversations, getOrCreateConversation, getMessages, sendMessage } = require('../controllers/message');
const { checkAuth } = require('../middlewares/auth');
const Conversation = require('../models/Conversation');
const { uploadChatImage } = require('../middlewares/upload');

const router = express.Router();

router.use(checkAuth);

async function loadConversationForMessage(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.conversationId)) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user._id,
  });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  req.conversation = conversation;
  return next();
}

function handleChatImageUpload(req, res, next) {
  uploadChatImage.single('image')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError || error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  });
}

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId', getMessages);
router.post('/conversations/:conversationId', loadConversationForMessage, handleChatImageUpload, sendMessage);

module.exports = router;
