import {
  type ExtractionOptions,
  extractionJobs,
  frames,
  getClient,
  videos,
} from "@video-frame-extractor-backend/database"
import { addExtractionJob, cancelJob } from "@video-frame-extractor-backend/queue"
import { getStorageProvider } from "@video-frame-extractor-backend/storage"
import { eq } from "drizzle-orm"
import { Router as createRouter, type Router } from "express"
import { z } from "zod"

export const extractRouter: Router = createRouter()

const extractRequestSchema = z.object({
  videoId: z.string().uuid(),
  options: z
    .object({
      interval: z.number().min(0.1).max(60).default(1),
      format: z.enum(["png", "jpeg", "webp"]).default("png"),
      quality: z.number().min(1).max(100).default(90),
      maxWidth: z.number().min(1).max(4096).optional(),
      maxHeight: z.number().min(1).max(4096).optional(),
    })
    .default({ interval: 1, format: "png", quality: 90 }),
})

extractRouter.post("/", async (req, res) => {
  const parsed = extractRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request",
      errors: parsed.error.flatten().fieldErrors,
    })
    return
  }

  const { videoId, options } = parsed.data

  try {
    const db = getClient()

    const [video] = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1)

    if (!video || video.deletedAt) {
      res.status(404).json({ message: "Video not found" })
      return
    }

    const extractionOptions: ExtractionOptions = {
      interval: options.interval,
      format: options.format,
      quality: options.quality,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
    }

    const totalFrames = Math.floor(video.duration / extractionOptions.interval) + 1

    const [job] = await db
      .insert(extractionJobs)
      .values({
        videoId,
        status: "pending",
        options: extractionOptions,
        totalFrames,
      })
      .returning()

    if (!job) {
      res.status(500).json({ message: "Failed to create extraction job" })
      return
    }

    await addExtractionJob({
      jobId: job.id,
      videoId: video.id,
      videoPath: video.storagePath,
      duration: video.duration,
      options: extractionOptions,
    })

    res.json({
      id: job.id,
      videoId: job.videoId,
      status: job.status,
      options: extractionOptions,
      totalFrames: job.totalFrames,
      extractedFrames: 0,
      createdAt: job.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Failed to start extraction:", error)
    res.status(500).json({ message: "Failed to start extraction" })
  }
})

const jobIdSchema = z.object({
  jobId: z.string().uuid(),
})

extractRouter.get("/:jobId", async (req, res) => {
  const parsed = jobIdSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid job ID" })
    return
  }

  try {
    const db = getClient()
    const [job] = await db
      .select()
      .from(extractionJobs)
      .where(eq(extractionJobs.id, parsed.data.jobId))
      .limit(1)

    if (!job) {
      res.status(404).json({ message: "Job not found" })
      return
    }

    let jobFrames:
      | Array<{
          frameNumber: number
          timestamp: number
          url: string
          width: number
          height: number
          format: string
        }>
      | undefined

    if (job.status === "completed") {
      const storage = getStorageProvider()
      const frameList = await db
        .select()
        .from(frames)
        .where(eq(frames.jobId, job.id))
        .orderBy(frames.frameNumber)
      jobFrames = await Promise.all(
        frameList.map(async (frame) => ({
          frameNumber: frame.frameNumber,
          timestamp: frame.timestamp,
          url: await storage.getSignedUrl(frame.storagePath, 3600),
          width: frame.width,
          height: frame.height,
          format: frame.format,
        })),
      )
    }

    res.json({
      id: job.id,
      videoId: job.videoId,
      status: job.status,
      options: job.options,
      totalFrames: job.totalFrames,
      extractedFrames: job.processedFrames ?? 0,
      frames: jobFrames,
      error: job.errorMessage ?? undefined,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString(),
    })
  } catch (error) {
    console.error("Failed to get job status:", error)
    res.status(500).json({ message: "Failed to get job status" })
  }
})

extractRouter.delete("/:jobId", async (req, res) => {
  const parsed = jobIdSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid job ID" })
    return
  }

  try {
    const db = getClient()
    const [job] = await db
      .select()
      .from(extractionJobs)
      .where(eq(extractionJobs.id, parsed.data.jobId))
      .limit(1)

    if (!job) {
      res.status(404).json({ message: "Job not found" })
      return
    }

    if (job.status === "completed" || job.status === "failed") {
      res.status(400).json({ message: "Cannot cancel completed or failed job" })
      return
    }

    const cancelled = await cancelJob(job.id)

    if (cancelled) {
      await db
        .update(extractionJobs)
        .set({ status: "failed", errorMessage: "Cancelled by user" })
        .where(eq(extractionJobs.id, job.id))

      res.json({ message: "Job cancelled" })
    } else {
      res.status(400).json({ message: "Cannot cancel job in current state" })
    }
  } catch (error) {
    console.error("Failed to cancel job:", error)
    res.status(500).json({ message: "Failed to cancel job" })
  }
})
