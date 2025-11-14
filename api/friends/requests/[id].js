import { connectDB } from "../../server/db.js";
import {
  updateStatus,
  removeById,
} from "../../server/controllers/friendRequestsController.js";
import { attachAuthFromHeader } from "../_authFromHeader.js";

export default async function handler(req, res) {
  const uri = process.env.MONGO_URI;
  if (!uri) return res.status(500).json({ error: "MONGO_URI not set" });

  if (!attachAuthFromHeader(req, res)) return;

  await connectDB(uri);

  // Adapt Vercel's req.query.id → what your controller expects (req.params.id)
  req.params = req.params || {};
  req.params.id = req.query.id;

  if (req.method === "PUT") {
    // Accept/decline a request (body: { action: 'accept' | 'decline' })
    return updateStatus(req, res, console.error);
  }

  if (req.method === "DELETE") {
    // Delete a friend request (either sender or recipient)
    return removeById(req, res, console.error);
  }

  return res.status(405).json({ error: "Method not allowed" });
}