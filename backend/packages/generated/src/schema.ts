// Generated Zod schemas from OpenAPI
// DO NOT EDIT MANUALLY
// Last generated: 2025-12-17T12:15:15.368Z

import { z } from "zod"

/** Extraction job status */
export const ExtractionStatusSchema = z.enum(["pending", "processing", "completed", "failed"])
export type ExtractionStatus = z.infer<typeof ExtractionStatusSchema>

/** Supported image formats */
export const ImageFormatSchema = z.enum(["png", "jpeg", "webp"])
export type ImageFormat = z.infer<typeof ImageFormatSchema>

