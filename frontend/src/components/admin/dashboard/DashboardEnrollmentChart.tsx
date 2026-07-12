import { useMemo, useRef, useState } from 'react'

import { useChartDraw } from '@/components/admin/dashboard/dashboard-motion'
import type { DashboardEnrollmentTrendPoint } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface DashboardEnrollmentChartProps {
  data: DashboardEnrollmentTrendPoint[]
  ready?: boolean
}

const W = 560
const H = 240
const PAD = { top: 20, right: 16, bottom: 32, left: 48 }

interface ChartPoint {
  x: number
  y: number
  label: string
  enrollments: number
  completions: number
}

function niceMax(value: number) {
  if (value <= 0) return 10
  const step = value <= 50 ? 10 : value <= 120 ? 20 : 50
  return Math.ceil(value / step) * step
}

function buildYTicks(max: number, count = 5) {
  return Array.from({ length: count }, (_, i) => Math.round((max * i) / (count - 1)))
}

/** Catmull-Rom → cubic Bézier — đường cong mượt qua các điểm */
function smoothLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

function buildChartGeometry(data: DashboardEnrollmentTrendPoint[]) {
  if (data.length === 0) {
    return {
      enrollLine: '',
      enrollArea: '',
      completionLine: '',
      points: [] as ChartPoint[],
      yTicks: [0, 25, 50, 75, 100],
      max: 100,
      baseline: PAD.top + (H - PAD.top - PAD.bottom),
    }
  }

  const rawMax = Math.max(...data.flatMap((d) => [d.enrollments, d.completions]), 1)
  const max = niceMax(rawMax)
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const baseline = PAD.top + innerH

  const points: ChartPoint[] = data.map((d, i) => {
    const x = PAD.left + (i / Math.max(data.length - 1, 1)) * innerW
    return {
      x,
      y: PAD.top + innerH - (d.enrollments / max) * innerH,
      label: d.label,
      enrollments: d.enrollments,
      completions: d.completions,
    }
  })

  const completionPoints = data.map((d, i) => {
    const x = PAD.left + (i / Math.max(data.length - 1, 1)) * innerW
    return {
      x,
      y: PAD.top + innerH - (d.completions / max) * innerH,
    }
  })

  const enrollLine = smoothLinePath(points)
  const enrollArea = `${enrollLine} L ${points[points.length - 1].x.toFixed(1)} ${baseline.toFixed(1)} L ${points[0].x.toFixed(1)} ${baseline.toFixed(1)} Z`
  const completionLine = smoothLinePath(completionPoints)

  return {
    enrollLine,
    enrollArea,
    completionLine,
    points,
    yTicks: buildYTicks(max),
    max,
    baseline,
  }
}

export function DashboardEnrollmentChart({ data, ready = true }: DashboardEnrollmentChartProps) {
  const enrollLineRef = useRef<SVGPathElement>(null)
  const enrollAreaRef = useRef<SVGPathElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const { enrollLine, enrollArea, completionLine, points, yTicks, max, baseline } = useMemo(
    () => buildChartGeometry(data),
    [data],
  )

  useChartDraw(enrollLineRef, enrollAreaRef, ready)

  const hovered = hoveredIndex != null ? points[hoveredIndex] : null
  const innerH = H - PAD.top - PAD.bottom

  return (
    <div data-dashboard-item className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Xu hướng ghi danh</h2>
          <p className="mt-1 text-sm text-[#6b7280]">7 tháng gần nhất — đăng ký mới vs hoàn thành</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-[#374151]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f05123]" />
            Ghi danh
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#374151]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            Hoàn thành
          </span>
        </div>
      </div>

      <div className="relative mt-6 overflow-x-auto">
        {hovered ? (
          <div
            className="pointer-events-none absolute z-10 min-w-[148px] rounded-lg border border-[#ececec] bg-white px-3 py-2 shadow-lg"
            style={{
              left: `clamp(8px, calc(${(hovered.x / W) * 100}% - 74px), calc(100% - 156px))`,
              top: 0,
            }}
          >
            <p className="text-xs font-bold text-[#111827]">{hovered.label}</p>
            <p className="mt-1.5 flex items-center justify-between gap-4 text-xs">
              <span className="text-[#6b7280]">Ghi danh</span>
              <span className="font-semibold text-[#f05123]">{hovered.enrollments}</span>
            </p>
            <p className="mt-0.5 flex items-center justify-between gap-4 text-xs">
              <span className="text-[#6b7280]">Hoàn thành</span>
              <span className="font-semibold text-[#2563eb]">{hovered.completions}</span>
            </p>
          </div>
        ) : null}

        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[320px] w-full select-none">
          <defs>
            <linearGradient id="enrollAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f05123" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f05123" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = PAD.top + innerH - (tick / max) * innerH
            return (
              <g key={tick}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text
                  x={PAD.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#9ca3af] text-[10px] font-medium"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {hovered ? (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD.top}
              y2={baseline}
              stroke="#f05123"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={0.35}
            />
          ) : null}

          <path ref={enrollAreaRef} d={enrollArea} fill="url(#enrollAreaGrad)" stroke="none" />
          <path
            d={completionLine}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          <path
            ref={enrollLineRef}
            d={enrollLine}
            fill="none"
            stroke="#f05123"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, i) => (
            <rect
              key={point.label + i}
              x={point.x - (W - PAD.left - PAD.right) / Math.max(points.length - 1, 1) / 2}
              y={PAD.top}
              width={(W - PAD.left - PAD.right) / Math.max(points.length - 1, 1)}
              height={innerH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {points.map((point, i) => (
            <text
              key={`label-${point.label}-${i}`}
              x={point.x}
              y={H - 8}
              textAnchor="middle"
              className={cn(
                'text-[10px] font-medium transition-colors',
                hoveredIndex === i ? 'fill-[#f05123]' : 'fill-[#9ca3af]',
              )}
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
