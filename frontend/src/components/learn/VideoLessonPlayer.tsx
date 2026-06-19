import { useEffect, useRef, type SyntheticEvent } from 'react'

import { parseVideoEmbed } from '@/lib/video-embed'

interface VideoLessonPlayerProps {
  url: string
  title?: string
  onProgressComplete?: () => void
}

const COMPLETION_RATIO = 0.9

export function VideoLessonPlayer({ url, title, onProgressComplete }: VideoLessonPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const completionReportedRef = useRef(false)
  const youtubeProgressRef = useRef({ currentTime: 0, duration: 0 })
  const embed = parseVideoEmbed(url)

  useEffect(() => {
    completionReportedRef.current = false
    youtubeProgressRef.current = { currentTime: 0, duration: 0 }
  }, [url])

  useEffect(() => {
    if (!onProgressComplete || (embed?.kind !== 'youtube' && embed?.kind !== 'vimeo')) return

    const reportCompletion = () => {
      if (completionReportedRef.current) return
      completionReportedRef.current = true
      onProgressComplete()
    }

    const handler = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string'
            ? (JSON.parse(event.data) as Record<string, unknown>)
            : (event.data as Record<string, unknown>)

        if (embed.kind === 'youtube' && event.origin === 'https://www.youtube.com') {
          if (data.event === 'onStateChange' && data.info === 0) {
            reportCompletion()
            return
          }

          if (data.event === 'infoDelivery' && data.info && typeof data.info === 'object') {
            const info = data.info as { currentTime?: number; duration?: number }
            if (typeof info.currentTime === 'number') {
              youtubeProgressRef.current.currentTime = info.currentTime
            }
            if (typeof info.duration === 'number') {
              youtubeProgressRef.current.duration = info.duration
            }
            const { currentTime, duration } = youtubeProgressRef.current
            if (duration > 0 && currentTime / duration >= COMPLETION_RATIO) reportCompletion()
          }
        }

        if (embed.kind === 'vimeo' && event.origin === 'https://player.vimeo.com') {
          const progress = data.data as { percent?: number } | undefined
          if (data.event === 'timeupdate' && (progress?.percent ?? 0) >= COMPLETION_RATIO) {
            reportCompletion()
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener('message', handler)
    const timer =
      embed.kind === 'youtube'
        ? window.setInterval(() => {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'getCurrentTime', args: [] }),
              'https://www.youtube.com',
            )
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'getDuration', args: [] }),
              'https://www.youtube.com',
            )
          }, 1000)
        : undefined

    return () => {
      window.removeEventListener('message', handler)
      if (timer) window.clearInterval(timer)
    }
  }, [onProgressComplete, embed?.kind])

  const handleNativeProgress = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (
      !completionReportedRef.current &&
      video.duration > 0 &&
      video.currentTime / video.duration >= COMPLETION_RATIO
    ) {
      completionReportedRef.current = true
      onProgressComplete?.()
    }
  }

  const handleIframeLoad = () => {
    if (embed?.kind === 'youtube') {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
        'https://www.youtube.com',
      )
    }
    if (embed?.kind === 'vimeo') {
      iframeRef.current?.contentWindow?.postMessage(
        { method: 'addEventListener', value: 'timeupdate' },
        'https://player.vimeo.com',
      )
    }
  }

  if (!embed) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] px-6 py-10 text-center text-sm text-[#666]">
        Chưa có link video cho bài học này.
      </div>
    )
  }

  if (embed.kind === 'file') {
    return (
      <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-[#ececec]">
        <video
          className="aspect-video w-full bg-[#111]"
          src={embed.embedUrl}
          controls
          title={title}
          onTimeUpdate={handleNativeProgress}
          onEnded={handleNativeProgress}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-[#ececec]">
      <div className="relative aspect-video w-full bg-[#111]">
        <iframe
          ref={iframeRef}
          src={embed.embedUrl}
          title={title ?? 'Video bài học'}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  )
}
