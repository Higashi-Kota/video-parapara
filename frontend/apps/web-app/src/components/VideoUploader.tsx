import { uploadVideo, type VideoUploadResult } from "@video-frame-extractor/api-client"
import { DropZone, Progress } from "@video-frame-extractor/ui"
import { useCallback, useState } from "react"

interface VideoUploaderProps {
  onUploadComplete: (video: VideoUploadResult) => void
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; fileName: string }
  | { status: "error"; message: string }

// Upload icon
function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <path d='M12 15V3m0 0l-4 4m4-4l4 4' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

// Alert icon
function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M12 8v4m0 4h.01' strokeLinecap='round' />
    </svg>
  )
}

export function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" })

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        setState({ status: "error", message: "動画ファイルを選択してください" })
        return
      }

      setState({ status: "uploading", progress: 0, fileName: file.name })

      try {
        const result = await uploadVideo(file, {
          onProgress: (percent) => {
            setState({ status: "uploading", progress: percent, fileName: file.name })
          },
        })
        setState({ status: "idle" })
        onUploadComplete(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : "アップロードに失敗しました"
        setState({ status: "error", message })
      }
    },
    [onUploadComplete],
  )

  const handleDismissError = useCallback(() => {
    setState({ status: "idle" })
  }, [])

  if (state.status === "uploading") {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-accent)]/30 rounded-xl p-8'>
        <div className='flex items-center gap-4 mb-6'>
          <div className='relative'>
            <div className='w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center'>
              <UploadIcon className='w-6 h-6 text-[var(--color-accent)] animate-pulse-slow' />
            </div>
            {/* Pulsing ring */}
            <div className='absolute inset-0 rounded-xl border-2 border-[var(--color-accent)]/30 animate-ping' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-[var(--color-text-primary)] font-medium mb-1'>アップロード中</p>
            <p className='text-[var(--color-text-muted)] text-sm truncate font-mono'>
              {state.fileName}
            </p>
          </div>
          <span className='text-2xl font-mono text-[var(--color-accent)]'>{state.progress}%</span>
        </div>
        <Progress value={state.progress} variant='accent' />
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-error)]/30 rounded-xl p-8'>
        <div className='text-center'>
          <div className='inline-flex p-4 bg-[var(--color-error)]/10 rounded-xl mb-4'>
            <AlertIcon className='w-8 h-8 text-[var(--color-error)]' />
          </div>
          <p className='text-[var(--color-error)] mb-6'>{state.message}</p>
          <button
            type='button'
            onClick={handleDismissError}
            className='px-5 py-2.5 bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors text-sm font-medium'
          >
            もう一度試す
          </button>
        </div>
      </div>
    )
  }

  return (
    <DropZone onFileSelect={handleFileSelect} accept='video/*'>
      <div className='relative'>
        <div className='inline-flex p-4 bg-[var(--color-bg-hover)] rounded-xl mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors'>
          <UploadIcon className='w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors' />
        </div>
        <p className='text-[var(--color-text-primary)] font-medium mb-2'>動画をドロップ</p>
        <p className='text-[var(--color-text-muted)] text-sm'>
          または<span className='text-[var(--color-accent)] mx-1'>クリック</span>して選択
        </p>
      </div>
    </DropZone>
  )
}
