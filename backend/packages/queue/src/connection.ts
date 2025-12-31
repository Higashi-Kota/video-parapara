import { Redis } from "ioredis"

let connection: Redis | null = null

export interface RedisConfig {
  host: string
  port: number
  password?: string
  maxRetriesPerRequest: number | null
}

export function getRedisConfig(): RedisConfig {
  const url = process.env.REDIS_URL
  if (url) {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 6379,
      password: parsed.password || undefined,
      maxRetriesPerRequest: null,
    }
  }
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  }
}

export function getConnection(): Redis {
  if (!connection) {
    connection = new Redis(getRedisConfig())
  }
  return connection
}

export function setConnection(redis: Redis): void {
  connection = redis
}

export async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.quit()
    connection = null
  }
}
