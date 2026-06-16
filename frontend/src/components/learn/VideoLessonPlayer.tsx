import { useEffect, useRef } from 'react'

import { parseVideoEmbed } from '@/lib/video-embed'

interface VideoLessonPlayerProps {
  url: string
  title?: string
  onEnded?: () => void
}

export function VideoLessonPlayer({ url, title, onEnded }: VideoLessonPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const embed = parseVideoEmbed(url)

  useEffect(() => {
    if (!onEnded || embed?.kind !== 'youtube') return

    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = JSON.parse(String(event.data)) as { event?: string; info?: number }
        if (data.event === 'onStateChange' && data.info === 0) onEnded()
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onEnded, embed?.kind])

  const handleIframeLoad = () => {
    if (embed?.kind !== 'youtube') return
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
      '*',
    )
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
          onEnded={onEnded}
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
