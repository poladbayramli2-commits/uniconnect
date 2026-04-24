import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ BÜTÜN İSTİFADƏÇİLƏRİ SİYAHISI - Kritik endpoint!
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, '-__v').sort({ createdAt: -1 }).limit(100);
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

    // uid VƏ YA email ilə axtar
    let user = await User.findOne({ $or: [{ uid }, { email }] });

    if (user) {
      // Əgər istifadəçi email ilə tapılıbsa amma uid fərqlidirsə, uid-ni yenilə
      const updateData = { 
        email, 
        uid, // UID-ni hər ehtimala qarşı sinxronla
        verifiedStudent, 
        updatedAt: new Date() 
      };
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (photoURL) updateData.photoURL = photoURL;

      user = await User.findOneAndUpdate(
        { uid },
        { $set: updateData },
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
    const { email, ...updates } = req.body;
    
    // Lazımsız sahələri təmizlə
    delete updates.uid;
    delete updates._id;

    console.log(`[Backend] Updating profile for UID: ${uid}, Email: ${email}`);

    // 1. UID ilə axtar və yenilə
    let user = await User.findOneAndUpdate(
      { uid },
      { ...updates, email, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // 2. Tapılmasa, Email ilə axtar (UID dəyişmiş ola bilər)
    if (!user && email) {
      console.log(`[Backend] User not found by UID, trying to find by email: ${email}`);
      user = await User.findOneAndUpdate(
        { email },
        { ...updates, uid, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }

    // 3. Yenə də tapılmasa, yeni istifadəçi yarat
    if (!user) {
      console.log(`[Backend] User still not found, creating new one for: ${email}`);
      if (!email) {
        return res.status(400).json({ success: false, error: 'Yeni istifadəçi üçün email mütləqdir' });
      }
      user = new User({
        uid,
        email,
        ...updates
      });
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(`[Backend] Update error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
