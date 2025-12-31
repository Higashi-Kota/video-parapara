import { existsSync } from "node:fs"
import ffmpeg from "fluent-ffmpeg"

let initialized = false

export async function initializeFfmpeg(): Promise<void> {
  if (initialized) return
  initialized = true

  try {
    const ffmpegStatic = await import("ffmpeg-static")
    const ffmpegPath = ffmpegStatic.default

    if (typeof ffmpegPath === "string" && existsSync(ffmpegPath)) {
      ffmpeg.setFfmpegPath(ffmpegPath)
      return
    }
  } catch {
    // ffmpeg-static not available, fall back to system ffmpeg
  }
}
