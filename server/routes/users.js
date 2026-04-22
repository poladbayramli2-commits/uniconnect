import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ BÜTÜN İSTİFADƏÇİLƏRİ SİYAHISI - Kritik endpoint!
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, '-__v').limit(100);
    res.json({ success: true, data: users, count: users.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// İSTİFADƏÇİ PROFILI GÖTÜR
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid }, '-__v');
    if (!user) {
      return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// YENİ İSTİFADƏÇİ QEYDIYYATI VƏ YA YOXLA (upsert)
router.post('/register', async (req, res) => {
  try {
    const { uid, email, firstName, lastName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ success: false, error: 'uid və email mütləqdir' });
    }

    const verifiedStudent = email.toLowerCase().endsWith('.edu.az');

    let user = await User.findOne({ $or: [{ uid }, { email }] });

    if (user) {
      user = await User.findOneAndUpdate(
        { uid },
        { email, firstName, lastName, photoURL, verifiedStudent, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      user = new User({
        uid,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        photoURL: photoURL || '',
        verifiedStudent,
      });
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PROFİL YENİLƏMƏ
router.put('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;
    delete updates.uid;
    delete updates.email;
    delete updates._id;

    const user = await User.findOneAndUpdate(
      { uid },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'İstifadəçi tapılmadı' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
