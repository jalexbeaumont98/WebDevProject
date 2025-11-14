// server/routes/gamesRoutes.js
import { Router } from 'express';
import {
  listMine,
  createOne,
  getById,
  acceptGame,
  setSecret,
  makeGuess,
  removeById
} from '../controllers/gamesController.js';
import { requireSignin } from '../controllers/authController.js';

const router = Router();

// everything under /api/games requires auth
router.use(requireSignin);

// GET /api/games       → my games
router.get('/', listMine);

// POST /api/games      → create game (you are playerA)
router.post('/', createOne);

// GET /api/games/:id   → view single game
router.get('/:id', getById);

// POST /api/games/:id/accept → invited player accepts
router.post('/:id/accept', acceptGame);

// POST /api/games/:id/secret → set your secret number
router.post('/:id/secret', setSecret);

// POST /api/games/:id/guess  → make a guess on your turn
router.post('/:id/guess', makeGuess);

// DELETE /api/games/:id      → delete a game you are in
router.delete('/:id', removeById);

export default router;