import { randomUUID } from "node:crypto"
import { mkdir, readdir, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import ffmpeg from "fluent-ffmpeg"
import sharp from "sharp"
import { initializeFfmpeg } from "./ffmpeg-path.js"

export interface ExtractionOptions {
  interval: number
  format: "png" | "jpeg" | "webp"
  quality: number
  maxWidth?: number
  maxHeight?: number
}

export interface ExtractedFrame {
  frameNumber: number
  timestamp: number
  buffer: Buffer
  width: number
  height: number
  format: string
}

export interface ExtractionProgress {
  current: number
  total: number
}

export type ProgressCallback = (progress: ExtractionProgress) => void

const DEFAULT_OPTIONS: ExtractionOptions = {
  interval: 1,
  format: "png",
  quality: 90,
}

export async function extractFrames(
  inputPath: string,
  duration: number,
  options: Partial<ExtractionOptions> = {},
  onProgress?: ProgressCallback,
): Promise<ExtractedFrame[]> {
  await initializeFfmpeg()
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const tempDir = join(tmpdir(), `frames-${randomUUID()}`)
  await mkdir(tempDir, { recursive: true })

  try {
    const totalFrames = Math.floor(duration / opts.interval) + 1
    const extMap = { png: "png", jpeg: "jpg", webp: "webp" } as const
    const ext = extMap[opts.format]

    await runFFmpegExtraction(inputPath, tempDir, opts, ext)

    const files = await readdir(tempDir)
    const frameFiles = files.filter((f) => f.startsWith("frame_") && f.endsWith(`.${ext}`)).sort()

    const frames: ExtractedFrame[] = []

    for (let i = 0; i < frameFiles.length; i++) {
      const frameFile = frameFiles[i]
      if (!frameFile) continue

      const filePath = join(tempDir, frameFile)
      let buffer: Buffer = await readFile(filePath)

      let image = sharp(buffer)
      const metadata = await image.metadata()

      if (opts.maxWidth || opts.maxHeight) {
        image = image.resize({
          width: opts.maxWidth,
          height: opts.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
      }

      if (opts.format === "jpeg") {
        buffer = Buffer.from(await image.jpeg({ quality: opts.quality }).toBuffer())
      } else {
        buffer = Buffer.from(await image.png({ quality: opts.quality }).toBuffer())
      }

      const resizedMetadata = await sharp(buffer).metadata()

      frames.push({
        frameNumber: i + 1,
        timestamp: i * opts.interval,
        buffer,
        width: resizedMetadata.width ?? metadata.width ?? 0,
        height: resizedMetadata.height ?? metadata.height ?? 0,
        format: opts.format,
      })

      onProgress?.({ current: i + 1, total: totalFrames })
    }

    return frames
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

function runFFmpegExtraction(
  inputPath: string,
  outputDir: string,
  options: ExtractionOptions,
  ext: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPattern = join(outputDir, `frame_%04d.${ext}`)
    const fps = 1 / options.interval

    let command = ffmpeg(inputPath)
      .outputOptions([`-vf`, `fps=${fps}`])
      .output(outputPattern)

    if (options.format === "jpeg") {
      command = command.outputOptions(["-q:v", String(Math.floor((100 - options.quality) / 3) + 1)])
    } else if (options.format === "webp") {
      command = command.outputOptions(["-quality", String(options.quality)])
    }

    command
      .on("end", () => resolve())
      .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run()
  })
}
