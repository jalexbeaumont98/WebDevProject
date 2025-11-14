import { connectDB } from "../../../server/db.js";
import {
  listMine,
  createOne,
  updateStatus,
  removeById
} from "../../../server/controllers/friendRequestsController.js";
import { attachAuthFromHeader } from "../../_authFromHeader.js";

export default async function handler(req, res) {
  const uri = process.env.MONGO_URI;
  if (!uri) return res.status(500).json({ error: "MONGO_URI not set" });

  // Require a valid JWT and populate req.auth
  if (!attachAuthFromHeader(req, res)) return;

  await connectDB(uri);

  if (req.method === "GET") {
    // list friend requests where I'm either fromUserId or toUserId
    return listMine(req, res, console.error);
  }

  if (req.method === "POST") {
    // create a new friend request from req.auth._id → toUserId
    return createOne(req, res, console.error);
    
  }

  if (req.method === "PUT") {
    // Update status of a request (accept/decline)
    // body: { requestId, action: 'accept' | 'decline' }
    const { requestId, action } = req.body;
    if (!requestId || !action) {
      return res.status(400).json({ error: "requestId and action are required" });
    }
    req.params = req.params || {};
    req.params.id = requestId;
    return handleController(updateStatus, req, res);
  }
  
  if (req.method === "DELETE") {
    // Delete a request
    // body: { requestId }
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "requestId is required" });
    }
    req.params = req.params || {};
    req.params.id = requestId;
    return handleController(removeById, req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}