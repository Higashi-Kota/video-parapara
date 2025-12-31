import { existsSync } from "node:fs"
import ffmpegStatic from "ffmpeg-static"
import ffmpeg from "fluent-ffmpeg"

// Use ffmpeg-static if available, otherwise fall back to system ffmpeg
if (typeof ffmpegStatic === "string" && existsSync(ffmpegStatic)) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  frameRate: number
  codec: string
}

export class VideoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "VideoValidationError"
  }
}

const MAX_DURATION_SECONDS = 60

export async function extractMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(new Error(`Failed to extract metadata: ${err.message}`))
        return
      }

      const videoStream = data.streams.find((s) => s.codec_type === "video")
      if (!videoStream) {
        reject(new VideoValidationError("No video stream found"))
        return
      }

      const duration = data.format.duration ?? 0
      if (duration > MAX_DURATION_SECONDS) {
        reject(
          new VideoValidationError(
            `Video duration (${duration.toFixed(1)}s) exceeds maximum allowed (${MAX_DURATION_SECONDS}s)`,
          ),
        )
        return
      }

      const frameRateStr = videoStream.r_frame_rate ?? "30/1"
      const parts = frameRateStr.split("/").map(Number)
      const num = parts[0] ?? 30
      const den = parts[1] ?? 1
      const frameRate = den !== 0 ? num / den : num

      resolve({
        duration,
        width: videoStream.width ?? 0,
        height: videoStream.height ?? 0,
        frameRate: Number.isFinite(frameRate) ? frameRate : 30,
        codec: videoStream.codec_name ?? "unknown",
      })
    })
  })
}
