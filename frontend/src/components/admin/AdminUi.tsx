import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CircleCheck, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/* ── Page shell ── */

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-[#ececec] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#f05123] uppercase">
          Quản trị
        </p>
        <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-[#1a1a1a]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

interface AdminCardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function AdminCard({ children, className = '', padding = false }: AdminCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[#e8e8e8] bg-white',
        padding && 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ── Table ── */

export function AdminTableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function AdminTable({ children }: { children: ReactNode }) {
  return <table className="min-w-full text-sm">{children}</table>
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[#ececec] bg-[#fcfcfc]">
      {children}
    </thead>
  )
}

export function AdminTh({
  children,
  className,
  align = 'left',
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <th
      className={cn(
        'px-5 py-3 text-left text-[11px] font-semibold tracking-wide text-[#9ca3af]',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#f3f4f6]">{children}</tbody>
}

export function AdminTr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('transition-colors hover:bg-[#fafafa]/80', className)}>
      {children}
    </tr>
  )
}

export function AdminTd({
  children,
  className,
  align = 'left',
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <td
      className={cn(
        'px-5 py-3.5 text-[#374151]',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function AdminEmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-[#9ca3af]">
        {message}
      </td>
    </tr>
  )
}

/* ── Badges & actions ── */

export function AdminBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
        tone === 'accent'
          ? 'bg-[#fff4f0] text-[#c2410c]'
          : 'bg-[#f3f4f6] text-[#4b5563]',
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-[#ecfdf5] text-[#047857]',
    LOCKED: 'bg-[#fffbeb] text-[#b45309]',
    DISABLED: 'bg-[#f3f4f6] text-[#6b7280]',
  }

  const labels: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    LOCKED: 'Khóa',
    DISABLED: 'Vô hiệu',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold',
        styles[status] ?? 'bg-[#f3f4f6] text-[#6b7280]',
      )}
    >
      {labels[status] ?? status}
    </span>
  )
}

type IconButtonVariant = 'default' | 'danger'

export function AdminIconButton({
  title,
  variant = 'default',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
  variant?: IconButtonVariant
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        variant === 'danger'
          ? 'text-[#dc2626] hover:bg-[#fef2f2]'
          : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Split panel (lessons / quizzes) ── */

export function AdminPanel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <AdminCard className={className}>
      <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
        {action}
      </div>
      {children}
    </AdminCard>
  )
}

export function AdminListItem({
  active,
  onClick,
  children,
  actions,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-[#f3f4f6] last:border-b-0',
        active ? 'bg-[#fff8f5]' : 'hover:bg-[#fafafa]',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'min-w-0 flex-1 px-4 py-3 text-left text-sm transition',
          active ? 'font-semibold text-[#f05123]' : 'text-[#374151]',
        )}
      >
        {children}
      </button>
      {actions ? <div className="flex shrink-0 items-center gap-0.5 pr-2">{actions}</div> : null}
    </div>
  )
}

/* ── Form helpers ── */

export function AdminChecklistItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition',
        checked
          ? 'border-[#f05123]/30 bg-[#fff8f5]'
          : 'border-[#ececec] hover:border-[#d1d5db] hover:bg-[#fafafa]',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[#d1d5db] text-[#f05123] focus:ring-[#f05123]/25"
      />
      <span className="text-sm font-medium text-[#374151]">{label}</span>
    </label>
  )
}

export function AdminNativeSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151]',
        'outline-none transition focus:border-[#f05123] focus:ring-2 focus:ring-[#f05123]/15',
        className,
      )}
      {...props}
    />
  )
}

export function AdminTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm text-[#374151]',
        'outline-none transition focus:border-[#f05123] focus:ring-2 focus:ring-[#f05123]/15',
        className,
      )}
      {...props}
    />
  )
}

/* ── Dashboard stat ── */

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  to: string
}) {
  return (
    <Link
      to={to}
      className="group block rounded-xl border border-[#e8e8e8] bg-white p-5 transition hover:border-[#f05123]/35 hover:shadow-[0_8px_24px_-12px_rgba(240,81,35,0.25)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff4f0] text-[#f05123] transition group-hover:bg-[#f05123] group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  )
}

/* ── Stepper & picker ── */

export function AdminStepper({
  steps,
  currentIndex,
}: {
  steps: Array<{ id: string; label: string }>
  currentIndex: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const done = index < currentIndex
        const active = index === currentIndex
        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-4 w-4 text-[#d1d5db]" /> : null}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                active && 'bg-[#fff4f0] text-[#f05123]',
                done && !active && 'bg-[#f3f4f6] text-[#374151]',
                !active && !done && 'text-[#9ca3af]',
              )}
            >
              {done ? <CircleCheck className="h-3.5 w-3.5 text-[#059669]" /> : null}
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function AdminPickerSection({
  title,
  description,
  loading,
  isEmpty,
  empty,
  onBack,
  children,
}: {
  title: string
  description: string
  loading?: boolean
  isEmpty?: boolean
  empty: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <AdminCard padding>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6b7280] hover:text-[#111827]"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Quay lại
            </button>
          ) : null}
          <h2 className="text-base font-bold text-[#111827]">{title}</h2>
          <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
        </div>
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">Đang tải...</p>
      ) : isEmpty ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">{empty}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </AdminCard>
  )
}

export function AdminPickerRow({
  icon: Icon,
  title,
  meta,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  meta?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-xl border border-[#ececec] bg-white p-4 text-left transition hover:border-[#f05123]/35 hover:bg-[#fff8f5]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f9fafb] text-[#6b7280]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[#111827]">{title}</span>
        {meta ? <span className="mt-0.5 block truncate text-xs text-[#9ca3af]">{meta}</span> : null}
      </span>
    </button>
  )
}

/* ── Modal ── */

interface AdminModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: AdminModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px] animate-[dialog-overlay-in_180ms_ease-out]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={cn(
          'relative z-10 flex max-h-[min(90vh,720px)] w-full flex-col overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]',
          'animate-[dialog-content-in_220ms_cubic-bezier(0.16,1,0.3,1)]',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ececec] px-6 py-4">
          <div className="min-w-0">
            <h2 id="admin-modal-title" className="text-base font-bold text-[#111827]">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#374151]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-[#ececec] bg-[#fcfcfc] px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AdminModalFooter({
  onCancel,
  onSubmit,
  cancelLabel = 'Hủy',
  submitLabel = 'Lưu',
  isLoading,
  submitDisabled,
}: {
  onCancel: () => void
  onSubmit: () => void
  cancelLabel?: string
  submitLabel?: string
  isLoading?: boolean
  submitDisabled?: boolean
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:opacity-60"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || submitDisabled}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#f05123] px-4 text-sm font-semibold text-white transition hover:bg-[#e04820] disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Đang lưu...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </>
  )
}
