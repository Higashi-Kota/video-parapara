import { downloadFramesZip, saveBlob } from "@video-frame-extractor/api-client"
import { Button, Spinner } from "@video-frame-extractor/ui"
import { useCallback, useState } from "react"

interface DownloadButtonProps {
  videoId: string
  disabled?: boolean
}

// Download icon
function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <path d='M12 3v12m0 0l-4-4m4 4l4-4' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

// Archive icon
function ArchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <path d='M21 8v13H3V8M1 3h22v5H1z' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M10 12h4' strokeLinecap='round' />
    </svg>
  )
}

export function DownloadButton({ videoId, disabled }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const blob = await downloadFramesZip(videoId)
      saveBlob(blob, `frames-${videoId}.zip`)
    } catch (err) {
      console.error("Download failed:", err)
      alert("ダウンロードに失敗しました")
    } finally {
      setIsDownloading(false)
    }
  }, [videoId, isDownloading])

  return (
    <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5'>
      <div className='flex items-center gap-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center'>
          <ArchiveIcon className='w-6 h-6 text-[var(--color-accent)]' />
        </div>
        <div className='flex-1'>
          <p className='text-[var(--color-text-primary)] font-medium'>ZIPダウンロード</p>
          <p className='text-[var(--color-text-muted)] text-sm'>すべてのフレームをまとめて保存</p>
        </div>
        <Button onClick={handleDownload} disabled={disabled || isDownloading} variant='primary'>
          {isDownloading ? (
            <>
              <Spinner size='sm' />
              準備中...
            </>
          ) : (
            <>
              <DownloadIcon className='w-4 h-4' />
              ダウンロード
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
