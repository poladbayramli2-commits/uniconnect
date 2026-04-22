import express from 'express';
import Letter from '../models/Letter.js';
import User from '../models/User.js';

const router = express.Router();

// GƏLƏN MƏKTUBLARI GÖTÜR (inbox)
router.get('/inbox/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const letters = await Letter.find({ recipientUids: uid })
      .sort({ createdAt: -1 })
      .limit(40);

    res.json({ success: true, data: letters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GÖNDƏRİLƏN MƏKTUBLARI GÖTÜR (sent)
router.get('/sent/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const letters = await Letter.find({ authorUid: uid })
      .sort({ createdAt: -1 })
      .limit(40);

    res.json({ success: true, data: letters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// TƏSADÜFİ 3 İSTİFADƏÇİYƏ MƏKTUB GÖNDƏR
router.post('/', async (req, res) => {
  try {
    const { authorUid, body } = req.body;

    if (!authorUid || !body) {
      return res.status(400).json({ success: false, error: 'authorUid və body mütləqdir' });
    }

    // Təsadüfi 3 istifadəçi seç
    const allUsers = await User.find({}, 'uid').limit(100);
    const recipients = allUsers
      .filter(u => u.uid !== authorUid)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(u => u.uid);

    if (recipients.length < 3) {
      return res.status(400).json({ success: false, error: 'Kifayət qədər istifadəçi yoxdur' });
    }

    const letter = new Letter({
      authorUid,
      recipientUids: recipients,
      body: body.slice(0, 4000)
    });

    await letter.save();

    res.json({ success: true, data: letter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
