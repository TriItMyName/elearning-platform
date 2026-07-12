import { useRef } from 'react'

import { useCountUpDecimal, useRingProgress } from '@/components/student/progress/progress-motion'
import { cn } from '@/lib/utils'

function ProgressRing({
  percent,
  label,
  sublabel,
  ready = true,
}: {
  percent: number
  label: string
  sublabel: string
  ready?: boolean
}) {
  const ringRef = useRef<SVGCircleElement>(null)
  const clamped = Math.min(100, Math.max(0, Math.round(percent)))
  useRingProgress(ringRef, clamped, ready)

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[88px] w-[88px] shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#fde8df" strokeWidth="10" />
          <circle
            ref={ringRef}
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#f05123"
            strokeWidth="10"
            strokeLinecap="round"
            style={{ strokeDashoffset: 326.73 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-[#242424]">{clamped}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#242424]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#7c838d]">{sublabel}</p>
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  suffix = '',
  decimals = 0,
  accent = 'orange',
  ready = true,
}: {
  label: string
  value: number
  suffix?: string
  decimals?: number
  accent?: 'orange' | 'slate'
  ready?: boolean
}) {
  const countRef = useCountUpDecimal(value, ready, decimals)

  return (
    <div className="rounded-2xl border border-[#ececec] bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#242424]">
        <span ref={countRef}>0</span>
        {suffix ? <span className="text-lg">{suffix}</span> : null}
      </p>
      <span
        className={cn(
          'mt-3 inline-block h-1 w-10 rounded-full',
          accent === 'orange' ? 'bg-[#f05123]' : 'bg-[#374151]',
        )}
      />
    </div>
  )
}

export function ProgressSummaryPanel({
  overallProgress,
  completedCourses,
  totalCourses,
  averageQuizScore,
  totalQuizAttempts,
  completedLessons,
  totalLessons,
  ready = true,
}: {
  overallProgress: number
  completedCourses: number
  totalCourses: number
  averageQuizScore: number
  totalQuizAttempts: number
  completedLessons: number
  totalLessons: number
  ready?: boolean
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div
        data-progress-item
        className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6"
      >
        <ProgressRing
          percent={overallProgress}
          label="Tiến độ tổng thể"
          sublabel={`${completedLessons}/${totalLessons} bài đã hoàn thành trên ${totalCourses} khóa`}
          ready={ready}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div data-progress-item>
          <SummaryStat
            label="Khóa hoàn thành"
            value={completedCourses}
            suffix={`/${totalCourses}`}
            ready={ready}
          />
        </div>
        <div data-progress-item>
          <SummaryStat
            label="Điểm quiz TB"
            value={averageQuizScore}
            decimals={1}
            accent="slate"
            ready={ready}
          />
        </div>
        <div data-progress-item className="sm:col-span-2">
          <SummaryStat
            label="Lượt làm quiz"
            value={totalQuizAttempts}
            accent="slate"
            ready={ready}
          />
        </div>
      </div>
    </div>
  )
}
