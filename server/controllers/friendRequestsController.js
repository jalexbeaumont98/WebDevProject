import FriendRequest from '../models/FriendRequest.js';
import mongoose from 'mongoose';

export const listMine = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const docs = await FriendRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    }).populate('fromUserId toUserId','displayName email');
    res.json(docs);
  } catch (e){ next(e); }
};

export const createOne = async (req, res, next) => {
  try {
    const fromUserId = req.auth._id;
    const { toUserId } = req.body;
    if (!mongoose.isValidObjectId(toUserId)) return res.status(400).json({ message: 'Invalid toUserId' });
    if (String(fromUserId) === String(toUserId)) return res.status(400).json({ message: 'Cannot friend yourself' });

    const doc = await FriendRequest.create({ fromUserId, toUserId });
    res.status(201).json(doc);
  } catch (e){ 
    if (e.code === 11000) return res.status(409).json({ message: 'Request already exists' });
    next(e); 
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const { id } = req.params;
    const { action } = req.body; // 'accept' | 'decline'
    const status = action === 'accept' ? 'accepted' : 'declined';

    const doc = await FriendRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (String(doc.toUserId) !== String(userId)) return res.status(403).json({ message: 'Not authorized to respond' });

    doc.status = status;
    await doc.save();
    res.json(doc);
  } catch (e){ next(e); }
};

export const removeById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await FriendRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (![String(doc.fromUserId), String(doc.toUserId)].includes(String(userId)))
      return res.status(403).json({ message: 'Not authorized' });

    await doc.deleteOne();
    res.json({ message: 'Deleted', deleted: doc });
  } catch (e){ next(e); }
};

export const listFriends = async (req, res, next) => {
  try {
    const userId = String(req.auth._id);

    const requests = await FriendRequest.find({
      status: 'accepted',
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    })
      .populate('fromUserId toUserId', '_id displayName email avatarUrl');

    // Map to “the other user” per request
    const rawFriends = requests.map(r => {
      const fromId = String(r.fromUserId._id);
      return fromId === userId ? r.toUserId : r.fromUserId;
    });

    // Dedupe by _id
    const unique = new Map();
    rawFriends.forEach(u => unique.set(String(u._id), u));

    res.json({
      count: unique.size,
      friends: Array.from(unique.values())
    });
  } catch (err) {
    next(err);
  }
};