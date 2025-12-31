import { useQueryClient } from "@tanstack/react-query"
import type { ExtractionJob, FrameInfo, VideoUploadResult } from "@video-frame-extractor/api-client"
import { useCallback, useState } from "react"
import { DownloadButton } from "./components/DownloadButton"
import { ExtractionProgress } from "./components/ExtractionProgress"
import { FrameGallery } from "./components/FrameGallery"
import { VideoList } from "./components/VideoList"
import { VideoUploader } from "./components/VideoUploader"

// Film strip icon component
function FilmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='2' y='2' width='20' height='20' rx='2' />
      <path d='M7 2v20M17 2v20M2 7h5M2 12h5M2 17h5M17 7h5M17 12h5M17 17h5' />
    </svg>
  )
}

export function App() {
  const queryClient = useQueryClient()
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [extractedFrames, setExtractedFrames] = useState<FrameInfo[] | null>(null)
  const [extractionComplete, setExtractionComplete] = useState(false)

  const handleUploadComplete = useCallback(
    (video: VideoUploadResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] })
      setSelectedVideoId(video.id)
      setExtractedFrames(null)
      setExtractionComplete(false)
    },
    [queryClient],
  )

  const handleSelectVideo = useCallback((videoId: string) => {
    setSelectedVideoId(videoId || null)
    setExtractedFrames(null)
    setExtractionComplete(false)
  }, [])

  const handleExtractionComplete = useCallback((job: ExtractionJob) => {
    setExtractedFrames(job.frames ?? null)
    setExtractionComplete(true)
  }, [])

  return (
    <div className='min-h-screen bg-[var(--color-bg)]'>
      {/* Ambient background gradient */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent)]/3 rounded-full blur-3xl' />
      </div>

      <div className='relative max-w-6xl mx-auto px-6 py-12'>
        {/* Header */}
        <header className='mb-16 animate-slide-up'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='p-3 bg-[var(--color-accent)]/10 rounded-xl border border-[var(--color-accent)]/20'>
              <FilmIcon className='w-8 h-8 text-[var(--color-accent)]' />
            </div>
            <div>
              <h1 className='font-display text-4xl text-[var(--color-text-primary)] tracking-tight'>
                Frame Extractor
              </h1>
              <p className='text-[var(--color-text-muted)] text-sm mt-1'>
                動画から1秒ごとにフレームを切り出す
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div className='flex items-center gap-4'>
            <div className='h-px flex-1 bg-gradient-to-r from-[var(--color-border)] via-[var(--color-accent)]/30 to-transparent' />
            <span className='text-xs text-[var(--color-text-muted)] font-mono tracking-widest uppercase'>
              Video to Frames
            </span>
            <div className='h-px flex-1 bg-gradient-to-l from-[var(--color-border)] via-[var(--color-accent)]/30 to-transparent' />
          </div>
        </header>

        <div className='grid gap-8 lg:grid-cols-5'>
          {/* Left Column: Upload and Video List */}
          <div className='lg:col-span-2 space-y-8'>
            <section className='animate-slide-up stagger-1'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-1 h-5 bg-[var(--color-accent)] rounded-full' />
                <h2 className='text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Upload
                </h2>
              </div>
              <VideoUploader onUploadComplete={handleUploadComplete} />
            </section>

            <section className='animate-slide-up stagger-2'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-1 h-5 bg-[var(--color-text-muted)] rounded-full' />
                <h2 className='text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                  Library
                </h2>
              </div>
              <VideoList selectedVideoId={selectedVideoId} onSelectVideo={handleSelectVideo} />
            </section>
          </div>

          {/* Right Column: Extraction and Frames */}
          <div className='lg:col-span-3 space-y-8'>
            {selectedVideoId ? (
              <>
                <section className='animate-slide-up stagger-3'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1 h-5 bg-[var(--color-success)] rounded-full' />
                    <h2 className='text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider'>
                      Extract
                    </h2>
                  </div>
                  <ExtractionProgress
                    key={selectedVideoId}
                    videoId={selectedVideoId}
                    onExtractionComplete={handleExtractionComplete}
                  />
                </section>

                {extractionComplete && (
                  <>
                    <section className='animate-slide-up'>
                      <FrameGallery
                        videoId={selectedVideoId}
                        frames={extractedFrames ?? undefined}
                      />
                    </section>

                    <section className='animate-slide-up'>
                      <DownloadButton videoId={selectedVideoId} />
                    </section>
                  </>
                )}
              </>
            ) : (
              <div className='h-full min-h-[400px] flex items-center justify-center animate-fade-in'>
                <div className='text-center max-w-sm'>
                  <div className='inline-flex p-6 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-subtle)] mb-6'>
                    <FilmIcon className='w-12 h-12 text-[var(--color-text-muted)]' />
                  </div>
                  <p className='text-[var(--color-text-secondary)] mb-2'>動画を選択してください</p>
                  <p className='text-sm text-[var(--color-text-muted)]'>
                    アップロードするか、ライブラリから選択
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className='mt-20 pt-8 border-t border-[var(--color-border-subtle)]'>
          <p className='text-center text-xs text-[var(--color-text-muted)] font-mono'>
            MP4 / WebM / MOV / AVI / MKV — max 60s
          </p>
        </footer>
      </div>
    </div>
  )
}
