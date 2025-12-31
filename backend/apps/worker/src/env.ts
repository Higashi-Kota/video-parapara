import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

// Load .env from project root - must be imported first
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") })

console.log("Environment loaded, LOCAL_STORAGE_PATH:", process.env.LOCAL_STORAGE_PATH)
