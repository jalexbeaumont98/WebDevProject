// api/games/[id]/accept.js
import { connectDB } from '../../../server/db.js';
import { acceptGame } from '../../../server/controllers/gamesController.js';
import { handleController } from '../../_utils.js';



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