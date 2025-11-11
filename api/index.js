// api/index.js  (Vercel treats files under /api as Serverless Functions)
import app from "../server/express.js";
import { connectDB } from "../server/db.js";

export default async function handler(req, res) {
  if (!process.env.MONGO_URI) {
    res.status(500).json({ error: "MONGO_URI not set" });
    return;
  }
  await connectDB(process.env.MONGO_URI); // connect once per lambda container
  return app(req, res);                   // hand off to Express
}