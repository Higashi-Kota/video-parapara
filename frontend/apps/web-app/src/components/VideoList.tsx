import { useQueryClient } from "@tanstack/react-query"
import { useVideosDelete, useVideosList } from "@video-frame-extractor/api-client"
import { Spinner } from "@video-frame-extractor/ui"
import { VideoCard } from "./VideoCard"

interface VideoListProps {
  selectedVideoId: string | null
  onSelectVideo: (videoId: string) => void
}

export function VideoList({ selectedVideoId, onSelectVideo }: VideoListProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useVideosList()
  const deleteMutation = useVideosDelete()

  const handleDelete = async (videoId: string) => {
    if (!confirm("この動画を削除しますか？")) return

    try {
      await deleteMutation.mutateAsync({ videoId })
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] })
      if (selectedVideoId === videoId) {
        onSelectVideo("")
      }
    } catch (err) {
      console.error("Failed to delete video:", err)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex items-center gap-3 text-[var(--color-text-muted)]'>
          <Spinner size='md' />
          <span className='text-sm'>読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <p className='text-[var(--color-error)] text-sm'>動画一覧の取得に失敗しました</p>
      </div>
    )
  }

  const videos = data?.status === 200 ? data.data : []

  if (videos.length === 0) {
    return (
      <div className='text-center py-12 border border-dashed border-[var(--color-border)] rounded-xl'>
        <p className='text-[var(--color-text-muted)] text-sm'>動画がありません</p>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className='animate-slide-in'
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <VideoCard
            video={video}
            isSelected={selectedVideoId === video.id}
            onSelect={() => onSelectVideo(video.id)}
            onDelete={() => handleDelete(video.id)}
          />
        </div>
      ))}
    </div>
  )
}
