const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:3001"

export interface VideoUploadResult {
  id: string
  filename: string
  mimeType: string
  size: number
  duration: number
  width: number
  height: number
  frameRate: number
  uploadedAt: string
}

export interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export class UploadError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message)
    this.name = "UploadError"
  }
}

export function uploadVideo(file: File, options?: UploadOptions): Promise<VideoUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("video", file)

    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        xhr.abort()
        reject(new Error("Upload aborted"))
      })
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options?.onProgress) {
        const percent = (event.loaded / event.total) * 100
        options.onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as { video: VideoUploadResult }
          resolve(response.video)
        } catch {
          reject(new UploadError(xhr.status, xhr.statusText, "Invalid JSON response"))
        }
      } else {
        let errorMessage = "Upload failed"
        try {
          const errorBody = JSON.parse(xhr.responseText)
          errorMessage = errorBody.message || errorBody.error || errorMessage
        } catch {
          errorMessage = xhr.statusText || errorMessage
        }
        reject(new UploadError(xhr.status, xhr.statusText, errorMessage))
      }
    }

    xhr.onerror = () => {
      reject(new UploadError(0, "Network Error", "Network error occurred"))
    }

    xhr.ontimeout = () => {
      reject(new UploadError(0, "Timeout", "Request timed out"))
    }

    xhr.open("POST", `${API_BASE_URL}/api/videos`)
    xhr.timeout = 5 * 60 * 1000 // 5 minutes for large files
    xhr.send(formData)
  })
}

export async function downloadFramesZip(videoId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/frames/download?videoId=${videoId}`)

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  return response.blob()
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
