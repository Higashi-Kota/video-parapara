import type { VideoInfo } from "@video-frame-extractor/api-client"

interface VideoCardProps {
  video: VideoInfo
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Trash icon
function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <path
        d='M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

// Play icon for selected state
function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M8 5.14v14l11-7-11-7z' />
    </svg>
  )
}

export function VideoCard({ video, isSelected, onSelect, onDelete }: VideoCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: Cannot use <button> because it contains a child <button> for delete action
    <div
      role='button'
      tabIndex={0}
      className={`
        group relative p-4 rounded-xl cursor-pointer w-full text-left
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]
        ${
          isSelected
            ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/40"
            : "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
        }
      `}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className='flex items-center gap-4'>
        {/* Icon */}
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
          transition-colors duration-200
          ${
            isSelected
              ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
              : "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-bg-card)]"
          }
        `}
        >
          {isSelected ? (
            <PlayIcon className='w-4 h-4' />
          ) : (
            <span className='font-mono text-xs'>{formatDuration(video.duration)}</span>
          )}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <p
            className={`font-medium truncate text-sm ${
              isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
            }`}
            title={video.filename}
          >
            {video.filename}
          </p>
          <div className='flex items-center gap-3 mt-1'>
            <span className='text-xs text-[var(--color-text-muted)] font-mono'>
              {video.width}x{video.height}
            </span>
            <span className='text-xs text-[var(--color-text-muted)]'>
              {formatFileSize(video.size)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <button
          type='button'
          onClick={handleDelete}
          className='
            p-2 rounded-lg
            text-[var(--color-text-muted)]
            opacity-0 group-hover:opacity-100
            hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10
            transition-all duration-200
          '
          title='削除'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>

      {/* Selected indicator bar */}
      {isSelected && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-accent)] rounded-r-full' />
      )}
    </div>
  )
}
