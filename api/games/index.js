// api/games/index.js
import { connectDB } from '../../server/db.js';
import { requireSignin } from '../../server/controllers/authController.js';
import {
  listMine,
  createOne
} from '../../server/controllers/gamesController.js';

async function handleController(req, res, controllerFn) {
  return new Promise((resolve) => {
    requireSignin(req, res, (err) => {
      if (err) {
        res.status(401).json({ error: err.message || 'Unauthorized' });
        return resolve();
      }
      controllerFn(req, res, (controllerErr) => {
        if (controllerErr) {
          console.error('Controller error:', controllerErr);
          const status = controllerErr.status || 500;
          res
            .status(status)
            .json({ error: controllerErr.message || 'Server error' });
        }
        resolve();
      });
    });
  });
}

export default async function handler(req, res) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: 'MONGO_URI not set' });
  }

  await connectDB(uri);

  if (req.method === 'GET') {
    // GET /api/games  -> list games for current user
    return handleController(req, res, listMine);
  }

  if (req.method === 'POST') {
    // POST /api/games -> create a new game
    return handleController(req, res, createOne);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}