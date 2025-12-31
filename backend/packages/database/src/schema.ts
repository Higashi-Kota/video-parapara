import { integer, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const extractionStatusEnum = pgEnum("extraction_status", [
  "pending",
  "processing",
  "completed",
  "failed",
])

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  duration: real("duration").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  frameRate: real("frame_rate").notNull(),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

export const extractionJobs = pgTable("extraction_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  status: extractionStatusEnum("status").notNull().default("pending"),
  options: jsonb("options").$type<ExtractionOptions>().notNull(),
  progress: integer("progress").notNull().default(0),
  totalFrames: integer("total_frames"),
  processedFrames: integer("processed_frames").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const frames = pgTable("frames", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => extractionJobs.id, { onDelete: "cascade" }),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  frameNumber: integer("frame_number").notNull(),
  timestamp: real("timestamp").notNull(),
  storagePath: text("storage_path").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  format: text("format").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type ExtractionOptions = {
  interval: number
  format: "png" | "jpeg" | "webp"
  quality: number
  maxWidth?: number
  maxHeight?: number
}

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type ExtractionJob = typeof extractionJobs.$inferSelect
export type NewExtractionJob = typeof extractionJobs.$inferInsert
export type Frame = typeof frames.$inferSelect
export type NewFrame = typeof frames.$inferInsert
