import { connectDB } from "../../../server/db.js";
import { signin } from "../../../server/controllers/authController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: "MONGO_URI not set" });
  }

  // Make sure Mongo is connected in this lambda
  await connectDB(uri);

  // Delegate to your existing Express-style controller
  return signin(req, res);
}