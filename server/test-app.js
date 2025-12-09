// server/test-app.js
import express from "express";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";


import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import friendsRoutes from "./routes/friendsRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";
import friendRequestRoutes from "./routes/friendRequestsRoutes.js";
// If you want to test other routes later, import them here too:
// import gameRoutes from "./routes/gamesRoutes.js";
// import friendsRoutes from "./routes/friendsRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

// Mount exactly as in your real express.js:
app.use("/api/auth", authRoutes);
// Mount API routes (all prefixed with /api)
app.use("/api/users", usersRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/friends/requests", friendRequestRoutes);
// app.use("/api/games", gameRoutes);
// app.use("/api/friends", friendsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Test app OK" });
});

// Generic error handler so tests see JSON
app.use((err, req, res, next) => {
  console.error("❌ Test Express Error:", err);
  res.status(err.status || 500).json({ error: err.message });
});

export default app;