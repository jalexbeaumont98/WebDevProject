// api/users/by-display-name/[displayName].js
import { connectDB } from '../../../server/db.js';
import { findByDisplayName } from '../../../server/controllers/usersController.js';
import { handleController } from '../../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: 'MONGO_URI not set' });
  }

  await connectDB(uri);


  const { displayName } = req.query;


  req.params = req.params || {};
  req.params.displayName = displayName;

  // Uses requireSignin + JSON body parsing inside
  return handleController(req, res, findByDisplayName);
}