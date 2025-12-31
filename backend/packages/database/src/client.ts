import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"

export type DatabaseClient = ReturnType<typeof createClient>

export function createClient(connectionString: string) {
  const sql = postgres(connectionString)
  return drizzle(sql, { schema })
}

let globalClient: DatabaseClient | null = null

export function getClient(): DatabaseClient {
  if (!globalClient) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    globalClient = createClient(connectionString)
  }
  return globalClient
}

export function setClient(client: DatabaseClient): void {
  globalClient = client
}
