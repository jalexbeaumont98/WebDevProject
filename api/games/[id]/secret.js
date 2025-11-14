// api/games/[id]/secret.js
import { connectDB } from '../../../server/db.js';
import { handleController } from '../../_utils.js';
import { setSecret } from '../../../server/controllers/gamesController.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: 'MONGO_URI not set' });
  }
  await connectDB(uri);

  // Vercel dynamic route param [id] → req.query.id
  const { id } = req.query || {};
  req.params = req.params || {};
  req.params.id = id;

  // This will:
  //  1) parse JSON body into req.body
  //  2) run requireSignin (sets req.auth or throws)
  //  3) call setSecret(req, res, next)
  return handleController(req, res, setSecret);
}