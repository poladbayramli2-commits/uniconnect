import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// OXUNMAMIŞ MESAJ SAYI (badge üçün)
router.get('/unread/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const rows = await Message.aggregate([
      {
        $match: {
          participants: uid,
          senderId: { $ne: uid },
          readBy: { $ne: uid },
        },
      },
      { $group: { _id: '$chatId', count: { $sum: 1 } } },
    ]);

    const byChat = {};
    let total = 0;
    for (const r of rows) {
      byChat[r._id] = r.count;
      total += r.count;
    }

    res.json({ success: true, data: { total, byChat } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ÇATI OXUNDU KİMİ İŞARƏLƏ (badge sıfırlamaq üçün)
router.post('/read/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { uid } = req.body || {};

    if (!uid) {
      return res.status(400).json({ success: false, error: 'uid mütləqdir' });
    }

    const result = await Message.updateMany(
      { chatId, participants: uid, readBy: { $ne: uid } },
      { $addToSet: { readBy: uid } }
    );

    res.json({ success: true, data: { modifiedCount: result.modifiedCount ?? result.nModified ?? 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
      participants: participants || [senderId],
      readBy: [senderId],
    });

    await message.save();

    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
