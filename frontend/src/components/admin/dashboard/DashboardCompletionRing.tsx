import { useRef } from 'react'

import { useCountUp, useRingProgress } from '@/components/admin/dashboard/dashboard-motion'

interface DashboardCompletionRingProps {
  percent: number
  quizAttempts: number
  ready?: boolean
}

export function DashboardCompletionRing({
  percent,
  quizAttempts,
  ready = true,
}: DashboardCompletionRingProps) {
  const ringRef = useRef<SVGCircleElement>(null)
  const quizRef = useCountUp(quizAttempts, ready)

  useRingProgress(ringRef, percent, ready)

  const radius = 54
  const circumference = 2 * Math.PI * radius

  return (
    <div
      data-dashboard-item
      className="flex h-full flex-col rounded-2xl border border-[#ececec] bg-[#1a1a1a] p-5 text-white sm:p-6"
    >
      <div>
        <h2 className="text-base font-bold">Tỷ lệ hoàn thành</h2>
        <p className="mt-1 text-sm text-[#9ca3af]">Trung bình toàn nền tảng</p>
      </div>

      <div className="relative mx-auto my-6 flex h-40 w-40 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#2a2a2a" strokeWidth="10" />
          <circle
            ref={ringRef}
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#f05123"
            strokeWidth="10"
            strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight">{percent}%</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#888]">Hoàn thành</span>
        </div>
      </div>

      <div className="mt-auto rounded-xl bg-[#252525] px-3 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#888]">Lượt làm quiz</p>
        <p className="mt-1 text-xl font-bold">
          <span ref={quizRef}>0</span>
        </p>
      </div>
    </div>
  )
}
