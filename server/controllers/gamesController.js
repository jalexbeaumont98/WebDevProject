import Game from '../models/Game.js';
import mongoose from 'mongoose';

export const listMine = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const docs = await Game.find({
      $or: [{ playerA: userId }, { playerB: userId }]
    }).sort({ updated: -1 });
    res.json(docs);
  } catch (e){ next(e); }
};

export const createOne = async (req, res, next) => {
  try {
    const playerA = req.auth._id;
    const { opponentId, range } = req.body;
    if (!mongoose.isValidObjectId(opponentId)) return res.status(400).json({ message: 'Invalid opponentId' });

    const doc = await Game.create({
      playerA, playerB: opponentId,
      range: { min: range?.min ?? 1, max: range?.max ?? 100 },
      status: 'waiting'
    });
    res.status(201).json(doc);
  } catch (e){ next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (![String(doc.playerA), String(doc.playerB)].includes(String(userId)))
      return res.status(403).json({ message: 'Not a participant' });
    res.json(doc);
  } catch (e){ next(e); }
};

export const updateById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (![String(doc.playerA), String(doc.playerB)].includes(String(userId)))
      return res.status(403).json({ message: 'Not a participant' });

    // allow updating status/range for now (no turn logic yet)
    if (req.body.status) doc.status = req.body.status;
    if (req.body.range)  doc.range  = req.body.range;
    doc.updated = new Date();
    await doc.save();
    res.json(doc);
  } catch (e){ next(e); }
};

export const removeById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (![String(doc.playerA), String(doc.playerB)].includes(String(userId)))
      return res.status(403).json({ message: 'Not a participant' });

    await doc.deleteOne();
    res.json({ message: 'Deleted', deleted: doc });
  } catch (e){ next(e); }
};