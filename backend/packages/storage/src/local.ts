import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import type { StorageProvider } from "./provider.js"

export class LocalStorageProvider implements StorageProvider {
  private readonly baseUrl: string

  constructor(
    private readonly basePath: string,
    baseUrl?: string,
  ) {
    this.baseUrl = baseUrl ?? process.env.API_BASE_URL ?? "http://localhost:3001"
  }

  async upload(key: string, buffer: Buffer, _contentType: string): Promise<string> {
    const filePath = this.getFilePath(key)
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, buffer)
    return key
  }

  async download(key: string): Promise<Buffer> {
    const filePath = this.getFilePath(key)
    return readFile(filePath)
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key)
    try {
      await unlink(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error
      }
    }
  }

  async getSignedUrl(key: string, _expiresIn: number): Promise<string> {
    return `${this.baseUrl}/storage/${key}`
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key)
    try {
      await access(filePath)
      return true
    } catch {
      return false
    }
  }

  private getFilePath(key: string): string {
    return join(this.basePath, key)
  }
}
