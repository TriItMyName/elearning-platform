import { FileUp, Loader2, Upload } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface LessonMediaInputProps {
  label: string
  url: string
  onUrlChange: (url: string) => void
  accept: string
  uploadTitle: string
  uploadIcon?: 'video' | 'document'
  disabled?: boolean
  disabledHint?: string
  isUploading?: boolean
  pendingFileName?: string | null
  urlError?: string | null
  hint?: string
  /** Chỉ upload file, ẩn ô nhập link */
  uploadOnly?: boolean
  onFileSelect: (file: File) => void
}

export function LessonMediaInput({
  label,
  url,
  onUrlChange,
  accept,
  uploadTitle,
  uploadIcon = 'video',
  disabled = false,
  disabledHint,
  isUploading = false,
  pendingFileName = null,
  urlError = null,
  hint,
  uploadOnly = false,
  onFileSelect,
}: LessonMediaInputProps) {
  const UploadIcon = uploadIcon === 'document' ? FileUp : Upload

  return (
    <div className="space-y-2">
      {uploadOnly ? (
        <p className="text-sm font-medium text-[#374151]">{label}</p>
      ) : (
        <Input
          label={label}
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://..."
          error={urlError ?? undefined}
        />
      )}
      {!uploadOnly && hint ? <p className="text-xs text-[#9ca3af]">{hint}</p> : null}
      {uploadOnly && url ? (
        <p className="truncate text-xs text-[#6b7280]">Đã có file: {url}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label
          title={uploadTitle}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]',
            (disabled || isUploading) && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadIcon className="h-4 w-4" />
          )}
          {isUploading ? 'Đang tải lên...' : 'Tải file lên'}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) onFileSelect(file)
            }}
          />
        </label>
        {pendingFileName ? (
          <span className="text-xs text-[#6b7280]">Đã chọn: {pendingFileName}</span>
        ) : null}
        {disabled && disabledHint ? (
          <span className="text-xs text-[#9ca3af]">{disabledHint}</span>
        ) : null}
      </div>
    </div>
  )
}
