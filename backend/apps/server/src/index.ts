// Load environment variables first (must be top import)
import "./env.js"
import path from "node:path"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { extractRouter } from "./routes/extract.js"
import { framesRouter } from "./routes/frames.js"
import { videosRouter } from "./routes/videos.js"

const app = express()
const PORT = process.env.PORT ?? 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173"
const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH ?? "./storage"

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// Serve static files from storage directory (for local development)
app.use("/storage", express.static(path.resolve(STORAGE_PATH)))

// API routes
app.use("/api/videos", videosRouter)
app.use("/api/extract", extractRouter)
app.use("/api/frames", framesRouter)

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ message: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
