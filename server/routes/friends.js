import express from 'express';
import FriendEdge from '../models/FriendEdge.js';
import User from '../models/User.js';

const router = express.Router();

// DOSTLUQ İSTƏKLƏRİNİ GÖTÜR (bir istifadəçinin bütün dostluq əlaqələri)
router.get('/edges/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const edges = await FriendEdge.find({
      participants: uid,
      status: 'accepted'
    }).sort({ updatedAt: -1 });

    // Hər edge üçün digər istifadəçinin məlumatlarını əlavə et
    const edgesWithProfiles = await Promise.all(
      edges.map(async (edge) => {
        const otherUid = edge.participants.find(p => p !== uid);
        const otherUser = await User.findOne({ uid: otherUid }, '-__v');
        return {
          ...edge.toObject(),
          otherUser
        };
      })
    );

    res.json({ success: true, data: edgesWithProfiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PENDING İSTƏKLƏRİ GÖTÜR
router.get('/pending/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const pendingEdges = await FriendEdge.find({
      participants: uid,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: pendingEdges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DOSTLUQ İSTƏYİ GÖNDƏR
router.post('/request', async (req, res) => {
  try {
    const { fromUid, toUid } = req.body;

    if (!fromUid || !toUid) {
      return res.status(400).json({ success: false, error: 'fromUid və toUid mütləqdir' });
    }

    const participants = [fromUid, toUid].sort();
    
    // Əlaqə artıq varmı yoxlayırıq
    let edge = await FriendEdge.findOne({ participants });
    
    if (edge) {
      if (edge.status === 'accepted') {
        return res.status(400).json({ success: false, error: 'Artıq dostuq!', data: edge });
      }
      if (edge.status === 'pending') {
        return res.status(400).json({ success: false, error: 'İstək artıq göndərilib!', data: edge });
      }
      // declined isə yenidən göndər
      edge.status = 'pending';
      edge.senderId = fromUid;
      await edge.save();
    } else {
      edge = new FriendEdge({
        participants,
        senderId: fromUid,
        status: 'pending'
      });
      await edge.save();
    }

    res.json({ success: true, data: edge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DOSTLUQ İSTƏYİNİ QƏBUL ET
router.post('/accept/:edgeId', async (req, res) => {
  try {
    const { edgeId } = req.params;
    
    const edge = await FriendEdge.findByIdAndUpdate(
      edgeId,
      { status: 'accepted', updatedAt: new Date() },
      { new: true }
    );

    if (!edge) {
      return res.status(404).json({ success: false, error: 'İstək tapılmadı' });
    }

    res.json({ success: true, data: edge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DOSTLUQ ƏLAQƏSİNİ YOXLA (iki istifadəçi dostmu?)
router.get('/check/:uid1/:uid2', async (req, res) => {
  try {
    const { uid1, uid2 } = req.params;
    const participants = [uid1, uid2].sort();
    
    const edge = await FriendEdge.findOne({ participants });
    
    res.json({ 
      success: true, 
      data: edge || null,
      isFriend: edge?.status === 'accepted',
      pending: edge?.status === 'pending'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
