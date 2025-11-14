// api/_authFromHeader.js
import jwt from "jsonwebtoken";
import config from "../config/config.js"; // adjust path if config is elsewhere

export function attachAuthFromHeader(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing" });
    return false;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    // mimic express-jwt: put payload on req.auth
    req.auth = decoded;
    return true;
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
    return false;
  }
}