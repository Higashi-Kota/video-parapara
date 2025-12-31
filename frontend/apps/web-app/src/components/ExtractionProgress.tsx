import {
  type ExtractionJob,
  useExtractGetStatus,
  useExtractStart,
} from "@video-frame-extractor/api-client"
import { Button, Spinner } from "@video-frame-extractor/ui"
import { useEffect, useRef, useState } from "react"
import { match } from "ts-pattern"

interface ExtractionProgressProps {
  videoId: string
  onExtractionComplete: (job: ExtractionJob) => void
}

// Play icon
function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden='true' className={className} viewBox='0 0 24 24' fill='currentColor'>
      <path d='M8 5.14v14l11-7-11-7z' />
    </svg>
  )
}

// Check icon
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
    >
      <path d='M20 6L9 17l-5-5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

// X icon
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
    >
      <path d='M18 6L6 18M6 6l12 12' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

// Display states for smooth transition
type DisplayState = "idle" | "pending" | "processing" | "finishing" | "completed" | "failed"

export function ExtractionProgress({ videoId, onExtractionComplete }: ExtractionProgressProps) {
  const [jobId, setJobId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [displayState, setDisplayState] = useState<DisplayState>("idle")
  const [displayProgress, setDisplayProgress] = useState({ extracted: 0, total: 0 })
  const completedJobRef = useRef<ExtractionJob | null>(null)

  const startMutation = useExtractStart()

  const { data: jobResponse } = useExtractGetStatus(jobId ?? "", {
    query: {
      enabled: !!jobId,
      refetchInterval: (query) => {
        const job = query.state.data
        if (!job) return 1000
        if (job.status !== 200) return false
        const status = job.data.status
        return status === "completed" || status === "failed" ? false : 1000
      },
    },
  })

  const job = jobResponse?.status === 200 ? jobResponse.data : null

  // Update display state based on job status with smooth transitions
  useEffect(() => {
    if (!job) return undefined

    let timer: ReturnType<typeof setTimeout> | undefined

    if (job.status === "pending") {
      setDisplayState("pending")
    } else if (job.status === "processing") {
      setDisplayState("processing")
      setDisplayProgress({
        extracted: job.extractedFrames ?? 0,
        total: job.totalFrames ?? 0,
      })
    } else if (job.status === "completed") {
      // First show 100% state - use actual extracted count
      const actualCount = job.extractedFrames ?? 0
      setDisplayProgress({
        extracted: actualCount,
        total: actualCount,
      })
      setDisplayState("finishing")
      completedJobRef.current = job

      // After showing 100%, transition to completed
      timer = setTimeout(() => {
        setDisplayState("completed")
        if (completedJobRef.current) {
          onExtractionComplete(completedJobRef.current)
        }
      }, 1200) // Show 100% for 1.2 seconds
    } else if (job.status === "failed") {
      setDisplayState("failed")
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [job, onExtractionComplete])

  const handleStartExtraction = async () => {
    setIsStarting(true)
    try {
      const result = await startMutation.mutateAsync({
        data: { videoId },
      })
      if (result.status === 200) {
        setJobId(result.data.id)
      }
    } catch (err) {
      console.error("Failed to start extraction:", err)
    } finally {
      setIsStarting(false)
    }
  }

  if (!jobId) {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6'>
        <div className='text-center'>
          <p className='text-[var(--color-text-secondary)] mb-5 text-sm'>
            1秒ごとにフレームを抽出します
          </p>
          <Button onClick={handleStartExtraction} disabled={isStarting} size='lg'>
            {isStarting ? (
              <>
                <Spinner size='sm' />
                開始中...
              </>
            ) : (
              <>
                <PlayIcon className='w-4 h-4' />
                フレーム抽出を開始
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-8'>
        <div className='flex items-center justify-center gap-3 text-[var(--color-text-muted)]'>
          <Spinner size='md' />
          <span>準備中...</span>
        </div>
      </div>
    )
  }

  // Calculate percentage for display
  const percentage =
    displayProgress.total > 0
      ? Math.round((displayProgress.extracted / displayProgress.total) * 100)
      : 0

  // Render progress bar component (shared between processing and finishing states)
  const renderProgressBar = (isFinishing: boolean) => {
    const { extracted, total } = displayProgress
    const pct = isFinishing ? 100 : percentage

    return (
      <div className='space-y-3'>
        {/* Progress Bar */}
        <div className='relative'>
          <div className='h-3 bg-[var(--color-bg-hover)] rounded-full overflow-hidden'>
            {/* Shimmer background - only when processing */}
            {!isFinishing && (
              <div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer'
                style={{ backgroundSize: "200% 100%" }}
              />
            )}
            {/* Progress fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFinishing
                  ? "bg-[var(--color-success)]"
                  : "bg-gradient-to-r from-[var(--color-accent-muted)] to-[var(--color-accent)]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className='flex items-center justify-between'>
          {/* Frame count */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-[var(--color-text-muted)]'>進捗:</span>
            <span className='font-mono text-sm text-[var(--color-text-secondary)]'>
              <span
                className={
                  isFinishing ? "text-[var(--color-success)]" : "text-[var(--color-accent)]"
                }
              >
                {extracted}
              </span>
              <span className='text-[var(--color-text-muted)]'> / </span>
              <span>{total}</span>
              <span className='text-[var(--color-text-muted)] ml-1'>フレーム</span>
            </span>
          </div>

          {/* Percentage */}
          <div className='flex items-baseline gap-1'>
            <span
              className={`text-2xl font-mono font-semibold transition-colors duration-300 ${
                isFinishing ? "text-[var(--color-success)]" : "text-[var(--color-accent)]"
              }`}
            >
              {pct}
            </span>
            <span className='text-sm text-[var(--color-text-muted)]'>%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6'>
      {match(displayState)
        .with("idle", () => null)
        .with("pending", () => (
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center'>
              <Spinner size='sm' />
            </div>
            <div>
              <p className='text-[var(--color-text-primary)] font-medium'>待機中</p>
              <p className='text-[var(--color-text-muted)] text-sm'>
                キューで処理を待っています...
              </p>
            </div>
          </div>
        ))
        .with("processing", () => (
          <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center'>
                <Spinner size='sm' className='text-[var(--color-accent)]' />
              </div>
              <p className='text-[var(--color-text-primary)] font-medium'>フレーム抽出中...</p>
            </div>
            {displayProgress.total > 0 && renderProgressBar(false)}
          </div>
        ))
        .with("finishing", () => (
          <div className='space-y-5'>
            {/* Header - celebrating completion */}
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center'>
                <CheckIcon className='w-4 h-4 text-[var(--color-success)]' />
              </div>
              <p className='text-[var(--color-success)] font-medium'>完了しました！</p>
            </div>
            {displayProgress.total > 0 && renderProgressBar(true)}
          </div>
        ))
        .with("completed", () => (
          <div className='flex items-center gap-4 animate-fade-in'>
            <div className='w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center'>
              <CheckIcon className='w-5 h-5 text-[var(--color-success)]' />
            </div>
            <div>
              <p className='text-[var(--color-success)] font-medium'>抽出完了</p>
              <p className='text-[var(--color-text-muted)] text-sm'>
                {displayProgress.total} フレームを抽出しました
              </p>
            </div>
          </div>
        ))
        .with("failed", () => (
          <div className='space-y-3'>
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-lg bg-[var(--color-error)]/10 flex items-center justify-center'>
                <XIcon className='w-5 h-5 text-[var(--color-error)]' />
              </div>
              <div>
                <p className='text-[var(--color-error)] font-medium'>抽出失敗</p>
                {job?.error && (
                  <p className='text-[var(--color-text-muted)] text-sm'>{job.error}</p>
                )}
              </div>
            </div>
          </div>
        ))
        .exhaustive()}
    </div>
  )
}
