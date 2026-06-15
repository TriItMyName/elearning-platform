export type VideoEmbedKind = 'youtube' | 'vimeo' | 'file' | 'unknown'

export interface VideoEmbedInfo {
  kind: VideoEmbedKind
  embedUrl: string
}

const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/

export function parseVideoEmbed(url: string): VideoEmbedInfo | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const youtubeMatch = trimmed.match(YOUTUBE_ID)
  if (youtubeMatch) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1&rel=0&modestbranding=1`,
    }
  }

  const vimeoMatch = trimmed.match(VIMEO_ID)
  if (vimeoMatch) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { kind: 'file', embedUrl: trimmed }
  }

  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('player.vimeo.com/')) {
    return { kind: 'unknown', embedUrl: trimmed }
  }

  return { kind: 'unknown', embedUrl: trimmed }
}
