import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

interface QuickAction {
  to: string
  label: string
  desc: string
  icon: ComponentType<{ className?: string }>
}

interface DashboardQuickActionsProps {
  actions: QuickAction[]
}

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  return (
    <div data-dashboard-item className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#111827]">Truy cập nhanh</h2>
        <p className="mt-1 text-sm text-[#6b7280]">Các module thường dùng khi vận hành nền tảng</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#ececec] bg-[#fafafa]/50 px-4 py-3.5 transition-all duration-200 hover:border-[#f05123]/30 hover:bg-[#fff8f5] hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#6b7280] shadow-sm transition-colors duration-200 group-hover:bg-[#fff4f0] group-hover:text-[#f05123]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#111827]">{label}</span>
              <span className="mt-0.5 block truncate text-xs text-[#9ca3af]">{desc}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#d1d5db] transition-all duration-200 group-hover:text-[#f05123]" />
          </Link>
        ))}
      </div>
    </div>
  )
}
