// api/friends/index.js
import { connectDB } from "../../server/db.js";
import { listFriends } from "../../server/controllers/friendRequestsController.js";
import { attachAuthFromHeader } from "../_authFromHeader.js";

export default async function handler(req, res) {
  console.log("🔥 HIT /api/friends", req.method);

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: "MONGO_URI not set" });
  }

  // Attach req.auth from Authorization: Bearer <token>
  if (!attachAuthFromHeader(req, res)) return;

  await connectDB(uri);

  if (req.method === "GET") {
    // Wrap controller so we always handle errors cleanly
    return listFriends(req, res, (err) => {
      console.error("listFriends error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Server error in listFriends" });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}