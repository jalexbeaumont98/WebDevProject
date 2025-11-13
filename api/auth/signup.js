// api/auth/signup.js
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
    const { name, email, password } = req.body;

    // basic sanity
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // relies on your User schema's virtual `password` and hashing logic
    const user = new User({ name, email, password });
    await user.save();

    return res.status(201).json({
      message: "User created",
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Could not create user" });
  }
}