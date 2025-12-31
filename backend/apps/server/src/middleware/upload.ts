import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import multer from "multer"

const ALLOWED_MIMETYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

/**
 * Decode filename from latin1 to UTF-8.
 * Multer receives filenames as latin1, but browsers send UTF-8 encoded names.
 * This function properly decodes Japanese and other non-ASCII characters.
 */
function decodeFilename(filename: string): string {
  try {
    // Convert latin1 string to UTF-8
    return Buffer.from(filename, "latin1").toString("utf8")
  } catch {
    return filename
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_TEMP_PATH || "/tmp")
  },
  filename: (_req, file, cb) => {
    // Decode the original filename for proper extension extraction
    const decodedName = decodeFilename(file.originalname)
    const uniqueName = `${randomUUID()}${extname(decodedName)}`
    cb(null, uniqueName)
  },
})

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      // Decode the filename for proper UTF-8 handling
      file.originalname = decodeFilename(file.originalname)
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIMETYPES.join(", ")}`))
    }
  },
})
