export interface StorageProvider {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn: number): Promise<string>
  exists(key: string): Promise<boolean>
}

export type StorageType = "local" | "r2"

export interface StorageConfig {
  type: StorageType
  localPath?: string
  r2?: {
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    bucket: string
    publicUrl?: string
  }
}
