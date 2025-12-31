import { unlink } from "node:fs/promises"
import { getClient, videos } from "@video-frame-extractor-backend/database"
import { getStorageProvider } from "@video-frame-extractor-backend/storage"
import { extractMetadata, VideoValidationError } from "@video-frame-extractor-backend/video"
import { eq, isNull } from "drizzle-orm"
import { Router as createRouter, type Router } from "express"
import { z } from "zod"
import { upload } from "../middleware/upload.js"

export const videosRouter: Router = createRouter()

videosRouter.get("/", async (_req, res) => {
  try {
    const db = getClient()
    const videoList = await db
      .select()
      .from(videos)
      .where(isNull(videos.deletedAt))
      .orderBy(videos.createdAt)

    const response = videoList.map((v) => ({
      id: v.id,
      filename: v.originalName,
      mimeType: v.mimeType,
      size: v.size,
      duration: v.duration,
      width: v.width,
      height: v.height,
      frameRate: v.frameRate,
      uploadedAt: v.createdAt.toISOString(),
    }))

    res.json(response)
  } catch (error) {
    console.error("Failed to list videos:", error)
    res.status(500).json({ message: "Failed to list videos" })
  }
})

videosRouter.post("/", upload.single("video"), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ message: "No video file provided" })
    return
  }

  try {
    const metadata = await extractMetadata(file.path)

    const storage = getStorageProvider()
    const storageKey = `videos/${file.filename}`
    const fileBuffer = await import("node:fs/promises").then((fs) => fs.readFile(file.path))
    await storage.upload(storageKey, fileBuffer, file.mimetype)

    const db = getClient()
    const [insertedVideo] = await db
      .insert(videos)
      .values({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        frameRate: metadata.frameRate,
        storagePath: storageKey,
      })
      .returning()

    if (!insertedVideo) {
      res.status(500).json({ message: "Failed to save video" })
      return
    }

    await unlink(file.path)

    res.status(201).json({
      video: {
        id: insertedVideo.id,
        filename: insertedVideo.originalName,
        mimeType: insertedVideo.mimeType,
        size: insertedVideo.size,
        duration: insertedVideo.duration,
        width: insertedVideo.width,
        height: insertedVideo.height,
        frameRate: insertedVideo.frameRate,
        uploadedAt: insertedVideo.createdAt.toISOString(),
      },
    })
  } catch (error) {
    await unlink(file.path).catch(() => {})

    if (error instanceof VideoValidationError) {
      res.status(400).json({ message: error.message })
      return
    }

    console.error("Failed to upload video:", error)
    res.status(500).json({ message: "Failed to upload video" })
  }
})

const videoIdSchema = z.object({
  videoId: z.string().uuid(),
})

videosRouter.get("/:videoId", async (req, res) => {
  const parsed = videoIdSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid video ID" })
    return
  }

  try {
    const db = getClient()
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, parsed.data.videoId))
      .limit(1)

    if (!video || video.deletedAt) {
      res.status(404).json({ message: "Video not found" })
      return
    }

    res.json({
      id: video.id,
      filename: video.originalName,
      mimeType: video.mimeType,
      size: video.size,
      duration: video.duration,
      width: video.width,
      height: video.height,
      frameRate: video.frameRate,
      uploadedAt: video.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Failed to get video:", error)
    res.status(500).json({ message: "Failed to get video" })
  }
})

videosRouter.delete("/:videoId", async (req, res) => {
  const parsed = videoIdSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid video ID" })
    return
  }

  try {
    const db = getClient()
    const [video] = await db
      .update(videos)
      .set({ deletedAt: new Date() })
      .where(eq(videos.id, parsed.data.videoId))
      .returning()

    if (!video) {
      res.status(404).json({ message: "Video not found" })
      return
    }

    res.json({ message: "Video deleted" })
  } catch (error) {
    console.error("Failed to delete video:", error)
    res.status(500).json({ message: "Failed to delete video" })
  }
})
