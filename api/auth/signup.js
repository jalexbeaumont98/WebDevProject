import { connectDB } from "../../server/db.js";
import User from "../../server/models/User.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: "MONGO_URI not set" });
  }

  await connectDB(uri);

  try {
    // Support both displayName and name (fallback)
    const displayName = req.body.displayName || req.body.name;
    const { email, password } = req.body;

    if (!displayName || !email || !password) {
      return res
        .status(400)
        .json({ error: "displayName (or name), email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({ displayName, email, password });
    await user.save(); // bcrypt pre-save hook runs here

    return res.status(201).json({
      message: "User created",
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    // For debugging during development you *could* send err.message,
    // but for now we keep it generic:
    return res.status(500).json({ error: "Could not create user" });
  }
}