import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, type SyntheticEvent } from 'react'

import { lessonsApi } from '@/api/lessons.api'
import { parseVideoEmbed } from '@/lib/video-embed'

interface UploadedVideoPlayerProps {
  courseId: number
  chapterId: number
  lessonId: number
  title?: string
  fallbackUrl?: string | null
  onProgressComplete?: () => void
}

export function UploadedVideoPlayer({
  courseId,
  chapterId,
  lessonId,
  title,
  fallbackUrl,
  onProgressComplete,
}: UploadedVideoPlayerProps) {
  const completionReportedRef = useRef(false)
  const embed = fallbackUrl ? parseVideoEmbed(fallbackUrl) : null
  const useStream = !embed || embed.kind === 'unknown'

  const streamQuery = useQuery({
    queryKey: ['lesson-video-stream', courseId, chapterId, lessonId],
    queryFn: () => lessonsApi.getVideoStream(courseId, chapterId, lessonId),
    enabled: useStream,
    staleTime: 5 * 60_000,
  })

  const objectUrl = useMemo(() => {
    if (!streamQuery.data) return null
    return URL.createObjectURL(streamQuery.data)
  }, [streamQuery.data])

  useEffect(() => {
    completionReportedRef.current = false
  }, [lessonId])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const handleProgress = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (
      !completionReportedRef.current &&
      video.duration > 0 &&
      video.currentTime / video.duration >= 0.9
    ) {
      completionReportedRef.current = true
      onProgressComplete?.()
    }
  }

  if (!useStream && embed) {
    if (embed.kind === 'file' || embed.kind === 'youtube' || embed.kind === 'vimeo') {
      return (
        <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-[#ececec]">
          {embed.kind === 'file' ? (
            <video
              className="aspect-video w-full bg-[#111]"
              src={embed.embedUrl}
              controls
              title={title}
              onTimeUpdate={handleProgress}
              onEnded={handleProgress}
            />
          ) : (
            <div className="relative aspect-video w-full bg-[#111]">
              <iframe
                src={embed.embedUrl}
                title={title ?? 'Video bài học'}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )
    }
  }

  if (streamQuery.isLoading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-[#ececec] bg-[#fafafa] text-sm text-[#666]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#f05123]" />
        Đang tải video...
      </div>
    )
  }

  if (streamQuery.isError || !objectUrl) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] px-6 py-10 text-center text-sm text-[#666]">
        Không phát được video bài học. Liên hệ giảng viên nếu lỗi vẫn tiếp diễn.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-[#ececec]">
      <video
        className="aspect-video w-full bg-[#111]"
        src={objectUrl}
        controls
        title={title}
        onTimeUpdate={handleProgress}
        onEnded={handleProgress}
      />
    </div>
  )
}
