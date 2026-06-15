import { useEffect, useState } from 'react'

import { useAuth } from '@/auth/auth.context'
import { getUserInitials } from '@/lib/user'

function formatDateTime(date: Date) {
  return {
    date: date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }
}

export function DashboardHero() {
  const { user } = useAuth()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const displayName = user?.fullName ?? user?.username ?? 'Admin'
  const initials = getUserInitials(displayName)
  const { date, time } = formatDateTime(now)

  return (
    <div
      data-dashboard-item
      className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-xl border border-[#f05123]/15 bg-gradient-to-br from-[#1a1a1a] via-[#242424] to-[#1a1a1a] px-4 py-3 sm:px-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f05123]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/4 h-24 w-24 rounded-full bg-[#ff7849]/10 blur-2xl" />

      <div className="relative flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f05123] to-[#ff7849] opacity-30 blur-md" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f05123] to-[#ff7849] text-sm font-bold text-white shadow-[0_4px_14px_-4px_rgba(240,81,35,0.55)]">
            {initials || 'AD'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-white">
            Xin chào, {displayName}
          </p>
          <p className="text-xs text-[#888]">Bảng điều khiển quản trị</p>
        </div>
      </div>

      <div className="relative shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right backdrop-blur-sm">
        <p className="text-xs capitalize text-[#bbb]">{date}</p>
        <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums tracking-wide text-white">
          {time}
        </p>
      </div>
    </div>
  )
}
