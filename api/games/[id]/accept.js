// api/games/[id]/accept.js
import { connectDB } from '../../../server/db.js';
import { requireSignin } from '../../../server/controllers/authController.js';
import { acceptGame } from '../../../server/controllers/gamesController.js';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: 'MONGO_URI not set' });
  }
  await connectDB(uri);

  const { id } = req.query;
  req.params = req.params || {};
  req.params.id = id;

  return handleController(req, res, acceptGame);
}