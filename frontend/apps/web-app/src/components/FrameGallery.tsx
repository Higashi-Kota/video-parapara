import { type FrameInfo, useFramesList } from "@video-frame-extractor/api-client"
import { Spinner } from "@video-frame-extractor/ui"
import { useState } from "react"

interface FrameGalleryProps {
  videoId: string
  frames?: FrameInfo[]
}

// Image icon
function ImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <rect x='3' y='3' width='18' height='18' rx='2' />
      <circle cx='8.5' cy='8.5' r='1.5' />
      <path d='M21 15l-5-5L5 21' />
    </svg>
  )
}

export function FrameGallery({ videoId, frames: providedFrames }: FrameGalleryProps) {
  const { data, isLoading, error } = useFramesList(
    { videoId },
    {
      query: {
        enabled: !providedFrames,
      },
    },
  )

  const frames = providedFrames ?? (data?.status === 200 ? data.data : [])

  if (isLoading && !providedFrames) {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-8'>
        <div className='flex items-center justify-center gap-3 text-[var(--color-text-muted)]'>
          <Spinner size='md' />
          <span>フレームを読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error && !providedFrames) {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-8'>
        <p className='text-center text-[var(--color-error)] text-sm'>
          フレームの取得に失敗しました
        </p>
      </div>
    )
  }

  if (frames.length === 0) {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-8'>
        <div className='text-center'>
          <div className='inline-flex p-4 bg-[var(--color-bg-hover)] rounded-xl mb-4'>
            <ImageIcon className='w-8 h-8 text-[var(--color-text-muted)]' />
          </div>
          <p className='text-[var(--color-text-muted)]'>フレームがありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-1 h-5 bg-[var(--color-accent)] rounded-full' />
          <h3 className='text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
            Frames
          </h3>
        </div>
        <span className='text-xs text-[var(--color-text-muted)] font-mono bg-[var(--color-bg-card)] px-2 py-1 rounded'>
          {frames.length} frames
        </span>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
        {frames.map((frame, index) => (
          <FrameCard key={frame.frameNumber} frame={frame} index={index} />
        ))}
      </div>
    </div>
  )
}

interface FrameCardProps {
  frame: FrameInfo
  index: number
}

function FrameCard({ frame, index }: FrameCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div
      className='group relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] animate-slide-up'
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Loading state */}
      {!isLoaded && !hasError && <div className='absolute inset-0 img-loading' />}

      {/* Error state */}
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)]'>
          <ImageIcon className='w-6 h-6 text-[var(--color-text-muted)]' />
        </div>
      )}

      {/* Image */}
      <img
        src={frame.url}
        alt={`Frame ${frame.frameNumber}`}
        className={`
          w-full h-full object-cover
          transition-all duration-300
          ${isLoaded ? "opacity-100" : "opacity-0"}
          group-hover:scale-105
        `}
        loading='lazy'
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {/* Frame number badge */}
      <div className='absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono text-white/80'>
        #{frame.frameNumber}
      </div>

      {/* Timestamp overlay on hover */}
      <div className='absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <p className='text-xs font-mono text-white/90'>{frame.timestamp.toFixed(1)}s</p>
      </div>

      {/* Hover border effect */}
      <div className='absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)]/50 rounded-lg transition-colors duration-200' />
    </div>
  )
}
