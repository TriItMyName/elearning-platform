import type { ComponentType, RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'

import { useCountUp } from '@/components/admin/dashboard/dashboard-motion'
import type { MetricCardId } from '@/lib/dashboard-metrics.storage'
import { cn } from '@/lib/utils'

export interface DashboardMetric {
  id: MetricCardId
  label: string
  value: number
  suffix?: string
  icon: ComponentType<{ className?: string }>
  to: string
  trend?: number
  accent?: 'orange' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose'
}

const ACCENTS = {
  orange: {
    icon: 'bg-[#fff4f0] text-[#f05123] group-hover:bg-[#f05123] group-hover:text-white',
    glow: 'from-[#f05123]/10 to-transparent',
  },
  blue: {
    icon: 'bg-[#eff6ff] text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white',
    glow: 'from-[#2563eb]/10 to-transparent',
  },
  emerald: {
    icon: 'bg-[#ecfdf5] text-[#059669] group-hover:bg-[#059669] group-hover:text-white',
    glow: 'from-[#059669]/10 to-transparent',
  },
  violet: {
    icon: 'bg-[#f5f3ff] text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white',
    glow: 'from-[#7c3aed]/10 to-transparent',
  },
  amber: {
    icon: 'bg-[#fffbeb] text-[#d97706] group-hover:bg-[#d97706] group-hover:text-white',
    glow: 'from-[#d97706]/10 to-transparent',
  },
  rose: {
    icon: 'bg-[#fff1f2] text-[#e11d48] group-hover:bg-[#e11d48] group-hover:text-white',
    glow: 'from-[#e11d48]/10 to-transparent',
  },
}

interface DashboardMetricCardProps {
  metric: DashboardMetric
  ready?: boolean
  overlay?: boolean
  sortable?: boolean
  ignoreClickRef?: RefObject<boolean>
}

export function DashboardMetricCard({
  metric,
  ready = true,
  overlay = false,
  sortable = false,
  ignoreClickRef,
}: DashboardMetricCardProps) {
  const navigate = useNavigate()
  const countRef = useCountUp(metric.value, ready && !overlay)
  const accent = ACCENTS[metric.accent ?? 'orange']
  const trend = metric.trend

  const body = (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-80',
          accent.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#6b7280]">{metric.label}</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span
              ref={overlay ? undefined : countRef}
              className="text-[2rem] font-bold leading-none tracking-tight text-[#111827]"
            >
              {overlay ? metric.value : '0'}
            </span>
            {metric.suffix ? (
              <span className="text-lg font-semibold text-[#9ca3af]">{metric.suffix}</span>
            ) : null}
          </p>
          {trend != null ? (
            <p
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-semibold',
                trend >= 0 ? 'text-emerald-600' : 'text-rose-500',
              )}
            >
              {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trend >= 0 ? '+' : ''}
              {trend}% so với tháng trước
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
            accent.icon,
          )}
        >
          <metric.icon className="h-5 w-5" />
        </span>
      </div>
      <div className="relative mt-4 flex items-center justify-between text-xs font-medium text-[#9ca3af]">
        <span>Xem chi tiết</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#f05123]" />
      </div>
    </>
  )

  const cardClass = cn(
    'group relative block overflow-hidden rounded-2xl border border-[#ececec] bg-white p-5 transition-all duration-200',
    !overlay && 'hover:border-[#f05123]/25 hover:shadow-[0_16px_40px_-20px_rgba(240,81,35,0.35)]',
    overlay && 'border-[#f05123]/30 ring-2 ring-[#f05123]/20',
    sortable && !overlay && 'cursor-grab active:cursor-grabbing',
    !sortable && !overlay && 'cursor-pointer',
  )

  if (overlay) {
    return <div className={cn('relative', cardClass)}>{body}</div>
  }

  if (sortable) {
    return (
      <div
        role="link"
        tabIndex={0}
        data-dashboard-item
        className={cardClass}
        onClick={() => {
          if (ignoreClickRef?.current) return
          navigate(metric.to)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (ignoreClickRef?.current) return
            navigate(metric.to)
          }
        }}
      >
        {body}
      </div>
    )
  }

  return (
    <a href={metric.to} data-dashboard-item className={cardClass} onClick={(e) => { e.preventDefault(); navigate(metric.to) }}>
      {body}
    </a>
  )
}
