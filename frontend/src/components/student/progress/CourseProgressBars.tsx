import { useRef } from 'react'

import { useAnimatedBars } from '@/components/student/progress/progress-motion'
import type { StudentCourseProgressSummary } from '@/types/student-progress'
import { cn } from '@/lib/utils'

interface CourseProgressBarsProps {
  courses: StudentCourseProgressSummary[]
  metric: 'completion' | 'quiz'
  ready?: boolean
  className?: string
}

function getMetricValue(course: StudentCourseProgressSummary, metric: 'completion' | 'quiz') {
  if (metric === 'completion') return Math.round(course.progress ?? 0)
  return Math.round(course.averageQuizScore ?? 0)
}

function getMetricLabel(course: StudentCourseProgressSummary, metric: 'completion' | 'quiz') {
  const value = getMetricValue(course, metric)
  if (metric === 'completion') {
    return `${value}% · ${course.completedLessons}/${course.totalLessons} bài`
  }
  if (course.quizAttempts === 0) return 'Chưa làm quiz'
  return `${value} điểm · ${course.quizAttempts} lần`
}

export function CourseProgressBars({
  courses,
  metric,
  ready = true,
  className,
}: CourseProgressBarsProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const dependencyKey = courses.map((course) => `${course.courseId}-${getMetricValue(course, metric)}`).join('|')

  useAnimatedBars(chartRef, ready, dependencyKey)

  const barColor = metric === 'completion' ? 'bg-[#f05123]' : 'bg-[#374151]'
  const barTrack = metric === 'completion' ? 'bg-[#fde8df]' : 'bg-[#ececec]'

  if (courses.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-[#d9dde3] bg-[#fafafa] px-5 py-10 text-center text-sm text-[#6b7280]',
          className,
        )}
      >
        Chưa có dữ liệu khóa học để hiển thị biểu đồ.
      </div>
    )
  }

  const sorted = [...courses].sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))
  const quizMax =
    metric === 'quiz'
      ? Math.max(...sorted.map((course) => course.averageQuizScore ?? 0), 1)
      : 100

  return (
    <div ref={chartRef} className={cn('space-y-4', className)}>
      {sorted.map((course) => {
        const value = getMetricValue(course, metric)
        const clamped =
          metric === 'completion'
            ? Math.min(100, Math.max(0, value))
            : course.quizAttempts === 0
              ? 0
              : Math.min(100, Math.max(0, (value / quizMax) * 100))

        return (
          <div key={`${metric}-${course.courseId}`} className="group">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#242424]">{course.courseTitle}</p>
                <p className="mt-0.5 text-xs text-[#7c838d]">{getMetricLabel(course, metric)}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-bold tabular-nums',
                  metric === 'completion' ? 'text-[#f05123]' : 'text-[#374151]',
                )}
              >
                {metric === 'completion' ? `${clamped}%` : course.quizAttempts > 0 ? `${clamped}` : '—'}
              </span>
            </div>
            <div
              className={cn('h-2.5 overflow-hidden rounded-full', barTrack)}
              role="progressbar"
              aria-label={
                metric === 'completion'
                  ? `Tiến độ hoàn thành ${course.courseTitle}`
                  : `Điểm quiz trung bình ${course.courseTitle}`
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clamped}
            >
              <div
                data-progress-bar
                data-progress-target={String(clamped)}
                className={cn('h-full rounded-full transition-none', barColor)}
                style={{ width: ready ? `${clamped}%` : '0%' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
