import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[#666]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

interface AdminCardProps {
  children: ReactNode
  className?: string
}

export function AdminCard({ children, className = '' }: AdminCardProps) {
  return (
    <div className={`rounded-2xl border border-[#ebebeb] bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function AdminTableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <table className="min-w-full divide-y divide-[#f0f0f0] text-sm">{children}</table>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    LOCKED: 'bg-amber-50 text-amber-700',
    DISABLED: 'bg-gray-100 text-gray-600',
  }

  const labels: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    LOCKED: 'Khóa',
    DISABLED: 'Vô hiệu',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

interface AdminModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function AdminModal({ open, title, onClose, children, footer }: AdminModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-lg font-bold text-[#242424]">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-[#f0f0f0] px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
