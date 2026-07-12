import { BookOpenCheck, HelpCircle, UserPlus } from 'lucide-react'

import type { DashboardActivityItem } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const TYPE_META = {
  enrollment: { icon: UserPlus, color: 'bg-[#fff4f0] text-[#f05123]', label: 'Ghi danh' },
  quiz: { icon: HelpCircle, color: 'bg-[#eff6ff] text-[#2563eb]', label: 'Quiz' },
  lesson: { icon: BookOpenCheck, color: 'bg-[#ecfdf5] text-[#059669]', label: 'Bài học' },
} as const

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

interface DashboardActivityFeedProps {
  items: DashboardActivityItem[]
}

export function DashboardActivityFeed({ items }: DashboardActivityFeedProps) {
  return (
    <div data-dashboard-item className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Hoạt động gần đây</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Luồng sự kiện học viên realtime</p>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </div>

      <ul className="relative space-y-0">
        <div className="absolute bottom-2 left-[19px] top-2 w-px bg-[#ececec]" aria-hidden />
        {items.map((item, index) => {
          const meta = TYPE_META[item.type]
          const Icon = meta.icon
          return (
            <li
              key={item.id}
              className={cn(
                'relative flex gap-4 py-3',
                index === 0 && 'pt-0',
                index === items.length - 1 && 'pb-0',
              )}
            >
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  meta.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 border-b border-[#f3f4f6] pb-3 last:border-0">
                <p className="text-sm leading-relaxed text-[#374151]">{item.message}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9ca3af]">
                  <span>{formatRelativeTime(item.at)}</span>
                  <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 font-medium text-[#6b7280]">
                    {meta.label}
                  </span>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
