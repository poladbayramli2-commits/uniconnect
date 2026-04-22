import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// ÇAT MESAJLARINI GÖTÜR
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// MESAJ GÖNDƏR
router.post('/', async (req, res) => {
  try {
    const { chatId, senderId, text, participants } = req.body;

    if (!chatId || !senderId || !text) {
      return res.status(400).json({ success: false, error: 'chatId, senderId və text mütləqdir' });
    }

    const message = new Message({
      chatId,
      senderId,
      text: text.slice(0, 2000),
      participants: participants || [senderId]
    });

    await message.save();

    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
