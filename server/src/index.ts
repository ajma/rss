import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";

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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

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
