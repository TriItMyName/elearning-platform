import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  open: boolean
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = 'Xác nhận',
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onCancel()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isLoading, onCancel])

  if (!open) return null

  const iconWrapClass =
    tone === 'danger' ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-[#fff4f0] text-[#f05123]'

  const confirmClass =
    tone === 'danger'
      ? 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'
      : 'bg-[#f05123] text-white hover:bg-[#e04820]'

  const handleDismiss = () => {
    if (!isLoading) onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px] animate-[dialog-overlay-in_180ms_ease-out]"
        aria-label="Đóng"
        onClick={handleDismiss}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] animate-[dialog-content-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="px-6 pt-6">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                iconWrapClass,
              )}
            >
              <AlertTriangle className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 space-y-2 pb-1">
              <h2 id="confirm-dialog-title" className="text-base font-bold leading-snug text-[#111827]">
                {title}
              </h2>
              <p id="confirm-dialog-description" className="text-sm leading-relaxed text-[#6b7280]">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#ececec] bg-[#fcfcfc] px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDismiss}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60',
              confirmClass,
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Đang xử lý...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
