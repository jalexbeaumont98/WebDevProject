// api/games/[id].js
import { connectDB } from '../../server/db.js';
import { requireSignin } from '../../server/controllers/authController.js';
import {
  getById,
  removeById
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

  // Next/Vercel puts the dynamic param in req.query
  const { id } = req.query;
  req.params = req.params || {};
  req.params.id = id;

  if (req.method === 'GET') {
    // GET /api/games/:id
    return handleController(req, res, getById);
  }

  if (req.method === 'DELETE') {
    // DELETE /api/games/:id
    return handleController(req, res, removeById);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}