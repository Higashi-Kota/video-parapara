import { type Job, Queue, Worker } from "bullmq"
import { getRedisConfig } from "../connection.js"

export const EXTRACTION_QUEUE_NAME = "extraction"

export interface ExtractionJobData {
  jobId: string
  videoId: string
  videoPath: string
  duration: number
  options: {
    interval: number
    format: "png" | "jpeg" | "webp"
    quality: number
    maxWidth?: number
    maxHeight?: number
  }
}

export interface ExtractionJobResult {
  success: boolean
  framesExtracted: number
  errorMessage?: string
}

let extractionQueue: Queue<ExtractionJobData, ExtractionJobResult> | null = null

export function getExtractionQueue(): Queue<ExtractionJobData, ExtractionJobResult> {
  if (!extractionQueue) {
    extractionQueue = new Queue<ExtractionJobData, ExtractionJobResult>(EXTRACTION_QUEUE_NAME, {
      connection: getRedisConfig(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600,
          count: 100,
        },
        removeOnFail: {
          age: 86400,
        },
      },
    })
  }
  return extractionQueue
}

export type ExtractionProcessor = (
  job: Job<ExtractionJobData, ExtractionJobResult>,
) => Promise<ExtractionJobResult>

export function createExtractionWorker(
  processor: ExtractionProcessor,
  concurrency = 1,
): Worker<ExtractionJobData, ExtractionJobResult> {
  return new Worker<ExtractionJobData, ExtractionJobResult>(EXTRACTION_QUEUE_NAME, processor, {
    connection: getRedisConfig(),
    concurrency,
  })
}

export async function addExtractionJob(
  data: ExtractionJobData,
): Promise<Job<ExtractionJobData, ExtractionJobResult>> {
  const queue = getExtractionQueue()
  return queue.add(data.jobId, data, {
    jobId: data.jobId,
  })
}

export type JobState =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed"
  | "prioritized"
  | "waiting-children"
  | "unknown"

export async function getJobState(jobId: string): Promise<JobState | null> {
  const queue = getExtractionQueue()
  const job = await queue.getJob(jobId)
  if (!job) return null
  return (await job.getState()) as JobState
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const queue = getExtractionQueue()
  const job = await queue.getJob(jobId)
  if (!job) return false

  const state = await job.getState()
  if (state === "waiting" || state === "delayed") {
    await job.remove()
    return true
  }
  return false
}

export async function closeExtractionQueue(): Promise<void> {
  if (extractionQueue) {
    await extractionQueue.close()
    extractionQueue = null
  }
}
