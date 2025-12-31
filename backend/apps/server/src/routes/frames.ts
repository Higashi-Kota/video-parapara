import { extractionJobs, frames, getClient, videos } from "@video-frame-extractor-backend/database"
import { getStorageProvider } from "@video-frame-extractor-backend/storage"
import archiver from "archiver"
import { eq, type SQL } from "drizzle-orm"
import { Router as createRouter, type Router } from "express"
import { z } from "zod"

export const framesRouter: Router = createRouter()

const listFramesSchema = z.object({
  videoId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
})

framesRouter.get("/", async (req, res) => {
  const parsed = listFramesSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const { videoId, jobId } = parsed.data

  if (!videoId && !jobId) {
    res.status(400).json({ message: "Either videoId or jobId is required" })
    return
  }

  try {
    const db = getClient()
    const storage = getStorageProvider()

    const conditions: SQL | undefined = jobId
      ? eq(frames.jobId, jobId)
      : videoId
        ? eq(frames.videoId, videoId)
        : undefined

    const frameList = await db.select().from(frames).where(conditions).orderBy(frames.frameNumber)

    const framesWithUrls = await Promise.all(
      frameList.map(async (frame) => ({
        frameNumber: frame.frameNumber,
        timestamp: frame.timestamp,
        url: await storage.getSignedUrl(frame.storagePath, 3600),
        width: frame.width,
        height: frame.height,
        format: frame.format,
      })),
    )

    res.json(framesWithUrls)
  } catch (error) {
    console.error("Failed to list frames:", error)
    res.status(500).json({ message: "Failed to list frames" })
  }
})

const downloadSchema = z.object({
  videoId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
})

framesRouter.get("/download", async (req, res) => {
  const parsed = downloadSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const { videoId, jobId } = parsed.data

  if (!videoId && !jobId) {
    res.status(400).json({ message: "Either videoId or jobId is required" })
    return
  }

  try {
    const db = getClient()
    const storage = getStorageProvider()

    let zipFilename = "frames"
    let conditions: SQL | undefined

    if (jobId) {
      conditions = eq(frames.jobId, jobId)
      const [job] = await db
        .select({ video: videos })
        .from(extractionJobs)
        .innerJoin(videos, eq(extractionJobs.videoId, videos.id))
        .where(eq(extractionJobs.id, jobId))
        .limit(1)
      if (job) {
        zipFilename = `${job.video.originalName.replace(/\.[^.]+$/, "")}_frames`
      }
    } else if (videoId) {
      conditions = eq(frames.videoId, videoId)
      const [video] = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1)
      if (video) {
        zipFilename = `${video.originalName.replace(/\.[^.]+$/, "")}_frames`
      }
    }

    const frameList = await db.select().from(frames).where(conditions).orderBy(frames.frameNumber)

    if (frameList.length === 0) {
      res.status(404).json({ message: "No frames found" })
      return
    }

    res.setHeader("Content-Type", "application/zip")
    // Use RFC 5987 encoding for non-ASCII filenames
    const safeFilename = zipFilename.replace(/[^\x20-\x7E]/g, "_")
    const encodedFilename = encodeURIComponent(zipFilename)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}.zip"; filename*=UTF-8''${encodedFilename}.zip`,
    )

    const archive = archiver("zip", { zlib: { level: 5 } })
    archive.pipe(res)

    for (const frame of frameList) {
      const buffer = await storage.download(frame.storagePath)
      const ext = frame.format === "png" ? "png" : "jpg"
      const filename = `frame_${String(frame.frameNumber).padStart(4, "0")}.${ext}`
      archive.append(buffer, { name: filename })
    }

    await archive.finalize()
  } catch (error) {
    console.error("Failed to download frames:", error)
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to download frames" })
    }
  }
})
