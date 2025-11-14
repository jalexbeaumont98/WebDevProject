// api/games/[id].js
import { connectDB } from '../../server/db.js';
import { handleController } from '../_utils.js';
import {
  getById,
  removeById
} from '../../server/controllers/gamesController.js';

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