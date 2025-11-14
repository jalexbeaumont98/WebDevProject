// api/friends/requests/[id].js
import { connectDB } from "../../../server/db.js";
import { updateStatus, removeById } from "../../../server/controllers/friendRequestsController.js";
import { attachAuthFromHeader } from "../../_authFromHeader.js";

export default async function handler(req, res) {
  console.log("🔥 HIT /api/friends/requests/[id]", req.method, req.query.id);

  const uri = process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ error: "MONGO_URI not set" });
  }

  // verify JWT & set req.auth from Authorization header
  if (!attachAuthFromHeader(req, res)) return;

  await connectDB(uri);

  // Vercel puts dynamic route params in req.query
  req.params = req.params || {};
  req.params.id = req.query.id;

  try {
    if (req.method === "PUT") {
      // expects body: { action: 'accept' | 'decline' }
      return updateStatus(req, res, (err) => {
        console.error("updateStatus error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "updateStatus failed" });
        }
      });
    }

    if (req.method === "DELETE") {
      return removeById(req, res, (err) => {
        console.error("removeById error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "removeById failed" });
        }
      });
    }

    // anything else: method not allowed
    return res.status(405).json({ error: "Method not allowed in [id].js" });
  } catch (err) {
    console.error("handler [id].js error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal error in [id].js" });
    }
  }
}