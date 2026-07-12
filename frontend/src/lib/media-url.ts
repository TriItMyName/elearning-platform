const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

function parseUrl(url: string): URL | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

export function isYouTubeUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (YOUTUBE_PATTERN.test(trimmed)) return true

  const parsed = parseUrl(trimmed)
  if (!parsed) return false

  const host = parsed.hostname.toLowerCase()
  return host === 'youtu.be' || host.endsWith('youtube.com')
}

export function isCloudinaryUrl(url: string): boolean {
  const parsed = parseUrl(url)
  if (!parsed) return false
  return parsed.hostname.toLowerCase() === 'res.cloudinary.com'
}

export function validateVideoLessonUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!parseUrl(trimmed)) return 'Link không hợp lệ'
  if (isYouTubeUrl(trimmed) || isCloudinaryUrl(trimmed)) return null
  return 'Link video chỉ hỗ trợ YouTube hoặc Cloudinary (res.cloudinary.com)'
}

export function validateDocumentLessonUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (!parseUrl(trimmed)) return 'Link không hợp lệ'
  if (isCloudinaryUrl(trimmed)) return null
  return 'Link tài liệu chỉ hỗ trợ Cloudinary (res.cloudinary.com)'
}

export const VIDEO_URL_HINT = 'YouTube hoặc Cloudinary (res.cloudinary.com)'
export const DOCUMENT_URL_HINT = 'Cloudinary (res.cloudinary.com)'
