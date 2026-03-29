import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import rateLimit from "express-rate-limit";

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { authRouter } from "./routes/auth";
import { feedsRouter } from "./routes/feeds";
import { foldersRouter } from "./routes/folders";
import { articlesRouter } from "./routes/articles";
import { startFeedRefresher } from "./services/feedRefresher";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/feeds", feedsRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/articles", articlesRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start background feed refresh (every 15 minutes)
  startFeedRefresher();
});

export default app;
