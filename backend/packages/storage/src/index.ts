import { LocalStorageProvider } from "./local.js"
import type { StorageConfig, StorageProvider } from "./provider.js"
import { R2StorageProvider } from "./r2.js"

export * from "./local.js"
export * from "./provider.js"
export * from "./r2.js"

let globalProvider: StorageProvider | null = null

export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.type) {
    case "local":
      if (!config.localPath) {
        throw new Error("localPath is required for local storage")
      }
      return new LocalStorageProvider(config.localPath)
    case "r2":
      if (!config.r2) {
        throw new Error("r2 config is required for R2 storage")
      }
      return new R2StorageProvider(config.r2)
    default:
      throw new Error(`Unknown storage type: ${config.type}`)
  }
}

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 storage requires R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET environment variables",
    )
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: process.env.R2_PUBLIC_URL,
  }
}

export function getStorageProvider(): StorageProvider {
  if (!globalProvider) {
    const type = (process.env.STORAGE_TYPE as StorageConfig["type"]) || "local"
    const config: StorageConfig = {
      type,
      localPath: process.env.LOCAL_STORAGE_PATH || "./storage",
      r2: type === "r2" ? getR2Config() : undefined,
    }
    globalProvider = createStorageProvider(config)
  }
  return globalProvider
}

export function setStorageProvider(provider: StorageProvider): void {
  globalProvider = provider
}
