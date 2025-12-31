// Load environment variables first (must be top import)
import "./env.js"
import { randomUUID } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { extractionJobs, frames, getClient } from "@video-frame-extractor-backend/database"
import {
  createExtractionWorker,
  type ExtractionJobData,
  type ExtractionJobResult,
} from "@video-frame-extractor-backend/queue"
import { getStorageProvider } from "@video-frame-extractor-backend/storage"
import { extractFrames } from "@video-frame-extractor-backend/video"
import type { Job } from "bullmq"
import { eq } from "drizzle-orm"

async function processExtractionJob(
  job: Job<ExtractionJobData, ExtractionJobResult>,
): Promise<ExtractionJobResult> {
  const { jobId, videoId, videoPath, duration, options } = job.data
  const db = getClient()
  const storage = getStorageProvider()

  console.log(`Starting extraction job ${jobId} for video ${videoId}`)

  try {
    await db
      .update(extractionJobs)
      .set({ status: "processing", startedAt: new Date() })
      .where(eq(extractionJobs.id, jobId))

    const videoBuffer = await storage.download(videoPath)

    const tempDir = join(tmpdir(), `worker-${randomUUID()}`)
    await mkdir(tempDir, { recursive: true })
    const tempVideoPath = join(tempDir, "input.mp4")
    await writeFile(tempVideoPath, videoBuffer)

    try {
      const extractedFrames = await extractFrames(
        tempVideoPath,
        duration,
        options,
        async (progress) => {
          const percent = Math.floor((progress.current / progress.total) * 100)
          await db
            .update(extractionJobs)
            .set({
              progress: percent,
              processedFrames: progress.current,
            })
            .where(eq(extractionJobs.id, jobId))

          await job.updateProgress(percent)
        },
      )

      for (const frame of extractedFrames) {
        const ext = frame.format === "png" ? "png" : "jpg"
        const storageKey = `frames/${videoId}/${jobId}/frame_${String(frame.frameNumber).padStart(4, "0")}.${ext}`
        const contentType = frame.format === "png" ? "image/png" : "image/jpeg"

        await storage.upload(storageKey, frame.buffer, contentType)

        await db.insert(frames).values({
          jobId,
          videoId,
          frameNumber: frame.frameNumber,
          timestamp: frame.timestamp,
          storagePath: storageKey,
          width: frame.width,
          height: frame.height,
          format: frame.format,
        })
      }

      await db
        .update(extractionJobs)
        .set({
          status: "completed",
          progress: 100,
          processedFrames: extractedFrames.length,
          completedAt: new Date(),
        })
        .where(eq(extractionJobs.id, jobId))

      console.log(`Extraction job ${jobId} completed with ${extractedFrames.length} frames`)

      return {
        success: true,
        framesExtracted: extractedFrames.length,
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    console.error(`Extraction job ${jobId} failed:`, errorMessage)

    await db
      .update(extractionJobs)
      .set({
        status: "failed",
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(extractionJobs.id, jobId))

    return {
      success: false,
      framesExtracted: 0,
      errorMessage,
    }
  }
}

const worker = createExtractionWorker(processExtractionJob)

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

worker.on("error", (err) => {
  console.error("Worker error:", err)
})

console.log("Extraction worker started")

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, closing worker...")
  await worker.close()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("Received SIGINT, closing worker...")
  await worker.close()
  process.exit(0)
})
