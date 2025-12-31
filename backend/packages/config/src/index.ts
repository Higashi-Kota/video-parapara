// Configuration package
// TODO: Implement configuration management

export interface AppConfig {
  port: number
  corsOrigin: string
  storagePath: string
  nodeEnv: "development" | "production" | "test"
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT) || 3001,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    storagePath: process.env.LOCAL_STORAGE_PATH ?? "./storage",
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
  }
}
