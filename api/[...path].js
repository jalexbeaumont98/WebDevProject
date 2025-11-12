// api/[...path].js
import app from "../server/express.js";
import { connectDB } from "../server/db.js";

export default async function handler(req, res) {
  const uri = process.env.MONGO_URI;
  if (!uri) return res.status(500).json({ error: "MONGO_URI not set" });

  await connectDB(uri);     // connects once per lambda container
  return app(req, res);     // Express has /api/auth, /api/games, etc.
}