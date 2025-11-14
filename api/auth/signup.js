// api/auth/signup.js
import { connectDB } from "../../server/db.js";
import { signup } from "../../server/controllers/authController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: "MONGO_URI not set" });
  }

  await connectDB(uri);
  return signup(req, res);
}