// server/express.js
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";

// routes
import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import friendsRoutes from "./routes/friendsRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";

const app = express();

// Built-in body parsers (replace body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compression());
app.use(helmet());

// In dev you may proxy, in prod you’re same-origin on Vercel.
// Keeping CORS permissive is fine during development.
app.use(cors({ origin: true, credentials: true }));

// Mount API routes (all prefixed with /api)
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/games", gamesRoutes);

// Health check
app.get("/api/status", (req, res) => res.json({ ok: true }));

export default app;
