export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'] as const
export const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'] as const
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024
export const MAX_DOCUMENT_SIZE_BYTES = 50 * 1024 * 1024
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const VIDEO_ACCEPT = VIDEO_EXTENSIONS.join(',')
export const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.join(',')
export const IMAGE_ACCEPT = IMAGE_EXTENSIONS.join(',')

function getExtension(filename: string) {
  const dot = filename.lastIndexOf('.')
  if (dot < 0) return ''
  return filename.slice(dot).toLowerCase()
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`
  return `${Math.round(bytes / 1024)}KB`
}

export function validateVideoFile(file: File): string | null {
  const ext = getExtension(file.name)
  if (!VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])) {
    return `Video chỉ hỗ trợ: ${VIDEO_EXTENSIONS.join(', ')}`
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return `Video tối đa ${formatSize(MAX_VIDEO_SIZE_BYTES)}`
  }
  return null
}

export function validateDocumentFile(file: File): string | null {
  const ext = getExtension(file.name)
  if (!DOCUMENT_EXTENSIONS.includes(ext as (typeof DOCUMENT_EXTENSIONS)[number])) {
    return `Tài liệu chỉ hỗ trợ: ${DOCUMENT_EXTENSIONS.join(', ')}`
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return `Tài liệu tối đa ${formatSize(MAX_DOCUMENT_SIZE_BYTES)}`
  }
  return null
}

export function validateImageFile(file: File): string | null {
  const ext = getExtension(file.name)
  if (!IMAGE_EXTENSIONS.includes(ext as (typeof IMAGE_EXTENSIONS)[number])) {
    return `Ảnh chỉ hỗ trợ: ${IMAGE_EXTENSIONS.join(', ')}`
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Ảnh tối đa ${formatSize(MAX_IMAGE_SIZE_BYTES)}`
  }
  return null
}
