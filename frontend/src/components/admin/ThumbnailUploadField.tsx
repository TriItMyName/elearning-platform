import { Image, Loader2, Upload, X } from 'lucide-react'
import { useState } from 'react'

import { uploadsApi } from '@/api/uploads.api'
import { getErrorMessage } from '@/lib/errors'
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/file-upload'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'

interface ThumbnailUploadFieldProps {
  thumbnail: string
  onThumbnailChange: (url: string) => void
  disabled?: boolean
}

export function ThumbnailUploadField({
  thumbnail,
  onThumbnailChange,
  disabled = false,
}: ThumbnailUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (file: File) => {
    const error = validateImageFile(file)
    if (error) {
      notify.error(error)
      return
    }

    setIsUploading(true)
    try {
      const { url } = await uploadsApi.uploadThumbnail(file)
      onThumbnailChange(url)
      notify.success('Đã tải thumbnail lên')
    } catch (e) {
      notify.error(getErrorMessage(e))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#374151]">Ảnh thumbnail</p>
      {thumbnail ? (
        <div className="relative inline-block">
          <img
            src={thumbnail}
            alt="Thumbnail khóa học"
            className="h-28 w-44 rounded-lg border border-[#e5e7eb] object-cover"
          />
          <button
            type="button"
            title="Xóa thumbnail"
            disabled={disabled || isUploading}
            onClick={() => onThumbnailChange('')}
            className={cn(
              'absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm transition hover:bg-[#f9fafb] hover:text-[#374151]',
              (disabled || isUploading) && 'pointer-events-none opacity-60',
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-28 w-44 items-center justify-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] text-[#9ca3af]">
          <Image className="h-8 w-8" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label
          title="Tải ảnh thumbnail lên Cloudinary"
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]',
            (disabled || isUploading) && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? 'Đang tải lên...' : thumbnail ? 'Đổi ảnh' : 'Tải thumbnail lên'}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void handleFileSelect(file)
            }}
          />
        </label>
      </div>
      <p className="text-xs text-[#9ca3af]">JPG, PNG, WebP, GIF — tối đa 5MB. Ảnh được upload trước khi lưu khóa học.</p>
    </div>
  )
}
