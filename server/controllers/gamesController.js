// server/controllers/gamesController.js
import Game from '../models/Game.js';
import mongoose from 'mongoose';

// GET /api/games
// list all games where I am playerA or playerB
export const listMine = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const docs = await Game.find({
      $or: [{ playerA: userId }, { playerB: userId }]
    }).sort({ updated: -1 });
    res.json(docs);
  } catch (e) {
    next(e);
  }
};

// POST /api/games
// body: { opponentId }
export const createOne = async (req, res, next) => {
  try {
    const playerA = req.auth._id;
    const { opponentId } = req.body;

    if (!mongoose.isValidObjectId(opponentId)) {
      return res.status(400).json({ message: 'Invalid opponentId' });
    }

    const doc = await Game.create({
      playerA,
      playerB: opponentId,
      range: { min: 1, max: 100 },  // fixed range for now
      status: 'waiting'
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
};

// GET /api/games/:id
export const getById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (
      ![String(doc.playerA), String(doc.playerB)].includes(String(userId))
    ) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    // hide secrets if game is active
    const safe = doc.toSafeJSON ? doc.toSafeJSON(userId) : doc;
    res.json(safe);
  } catch (e) {
    next(e);
  }
};

// POST /api/games/:id/accept
export const acceptGame = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Not found' });

    if (String(game.playerB) !== String(userId)) {
      return res
        .status(403)
        .json({ message: 'Only invited player can accept' });
    }

    if (game.status !== 'waiting') {
      return res
        .status(400)
        .json({ message: 'Game is not in waiting state' });
    }

    game.status = 'choosing';
    game.updated = new Date();

    await game.save();
    res.json(game);
  } catch (e) {
    next(e);
  }
};

// POST /api/games/:id/secret
// body: { value: number }
export const setSecret = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    let { secret } = req.body;

    // Coerce to number
    const num = Number(secret);

    if (!Number.isInteger(num)) {
      return res
        .status(400)
        .json({ message: 'Secret value must be a number' });
    }

    
    if (num < 1 || num > 100) {
      return res
        .status(400)
        .json({ message: 'Secret must be between 1 and 100' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Not found' });

    const userIdStr = String(userId);
    const aId = String(game.playerA);
    const bId = String(game.playerB);

    if (![aId, bId].includes(userIdStr)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    if (!['waiting', 'choosing'].includes(game.status)) {
      return res
        .status(400)
        .json({ message: 'Secrets already locked in or game finished' });
    }

    const isA = userIdStr === aId;

    if (isA) {
      if (game.hasSecretA) {
        return res.status(400).json({ message: 'Secret already set' });
      }
      game.secretA = num;
      game.hasSecretA = true;
    } else {
      if (game.hasSecretB) {
        return res.status(400).json({ message: 'Secret already set' });
      }
      game.secretB = num;
      game.hasSecretB = true;
    }

    // if both have set secrets, activate game
    if (game.hasSecretA && game.hasSecretB) {
      game.status = 'active';
      game.turnUserId = game.playerA; // or randomize later
    } else {
      game.status = 'choosing';
    }

    game.updated = new Date();
    await game.save();

    const safe = game.toSafeJSON ? game.toSafeJSON(userId) : game;
    res.json(safe);
  } catch (e) {
    next(e);
  }
};

// POST /api/games/:id/guess
// body: { value: number }
export const makeGuess = async (req, res, next) => {
  try {
    const userId = req.auth._id;

    
    // Debug: see what the client actually sent
    console.log("makeGuess req.body:", req.body);

    // Coerce to number
    const raw = req.body?.value ?? req.body?.guess;

    const num = Number(raw);

    if (!Number.isInteger(num)) {
      return res
        .status(400)
        .json({ message: 'Guess must be a number' });
    }

    if (num < 1 || num > 100) {
      return res
        .status(400)
        .json({ message: 'Guess must be between 1 and 100' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Not found' });

    const userIdStr = String(userId);
    const aId = String(game.playerA);
    const bId = String(game.playerB);

    if (![aId, bId].includes(userIdStr)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ message: 'Game is not active' });
    }

    if (String(game.turnUserId) !== userIdStr) {
      return res.status(403).json({ message: 'Not your turn' });
    }

    const isA = userIdStr === aId;
    const targetId = isA ? game.playerB : game.playerA;
    const targetSecret = isA ? game.secretB : game.secretA;

    let result;
    if (num < targetSecret) result = 'low';
    else if (num > targetSecret) result = 'high';
    else result = 'correct';

    game.guesses.push({
      player: userId,
      target: targetId,
      num,
      result
    });

    if (result === 'correct') {
      game.status = 'finished';
      game.winnerUserId = userId;
    } else {
      // flip turn
      game.turnUserId = isA ? game.playerB : game.playerA;
    }

    game.updated = new Date();
    await game.save();

    const safe = game.toSafeJSON ? game.toSafeJSON(userId) : game;

    res.json({
      result,
      game: safe
    });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/games/:id
export const removeById = async (req, res, next) => {
  try {
    const userId = req.auth._id;
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (
      ![String(doc.playerA), String(doc.playerB)].includes(String(userId))
    ) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    await doc.deleteOne();
    res.json({ message: 'Deleted', deleted: doc });
  } catch (e) {
    next(e);
  }
};