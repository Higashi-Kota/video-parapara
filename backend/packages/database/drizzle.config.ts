import path from "node:path"
import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

// drizzle-kit transpiles to CJS at runtime, making __dirname available
declare const __dirname: string

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required")
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
