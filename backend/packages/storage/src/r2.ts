import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { StorageConfig, StorageProvider } from "./provider.js"

export class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicUrl?: string

  constructor(config: NonNullable<StorageConfig["r2"]>) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: "auto",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
    this.bucket = config.bucket
    this.publicUrl = config.publicUrl
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    )
    return key
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
    const stream = response.Body
    if (!stream) {
      throw new Error(`Failed to download ${key}: empty response`)
    }
    return Buffer.from(await stream.transformToByteArray())
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn },
    )
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )
      return true
    } catch (error) {
      if ((error as { name?: string }).name === "NotFound") {
        return false
      }
      throw error
    }
  }
}
