import { BookOpen, Calendar, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import {
  COURSE_GRID_BASE_CLASS,
  COURSE_GRID_CLASS,
  COURSE_GRID_CLASS_LOOSE,
  HOME_COURSE_COLS,
  HOME_COURSE_ROWS_GRID,
} from '@/constants/courses'
import { useContinueLearnUrl } from '@/hooks/useEnrollment'
import { COURSE_STATUS_LABEL } from '@/types/course'
import type { Course } from '@/types/course'

const GRADIENTS = [
  'from-[#f05123] to-[#ff7849]',
  'from-[#ea580c] to-[#fb923c]',
  'from-[#78716c] to-[#a8a29e]',
  'from-[#059669] to-[#34d399]',
  'from-[#b45309] to-[#fbbf24]',
]

function courseGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length]
}

function CourseCoverImage({
  course,
  className = 'h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]',
}: {
  course: Pick<Course, 'id' | 'thumbnail' | 'title'>
  className?: string
}) {
  if (course.thumbnail) {
    return (
      <img
        src={course.thumbnail}
        alt={`Thumbnail khóa học ${course.title}`}
        className={className}
        loading="lazy"
      />
    )
  }

  return <div className={`h-full w-full bg-gradient-to-br ${courseGradient(course.id)}`} />
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN')
  } catch {
    return iso
  }
}

interface CourseItemProps {
  course: Course
  className?: string
  enrolled?: boolean
  progressPercent?: number | null
  variant?: 'default' | 'tile' | 'compact'
}

export function CourseItem({
  course,
  className = 'w-full',
  enrolled = false,
  progressPercent = null,
  variant = 'default',
}: CourseItemProps) {
  const statusLabel = COURSE_STATUS_LABEL[course.status] ?? `Trạng thái ${course.status}`
  const continueUrl = useContinueLearnUrl(enrolled ? course : null)
  const isTile = variant === 'tile'

  if (variant === 'compact') {
    const showProgress = enrolled && progressPercent != null
    const cardUrl = enrolled ? continueUrl : `/courses/${course.slug}`

    return (
      <Link
        to={cardUrl}
        className={`${className} group flex h-[108px] min-w-0 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white transition-colors duration-200 hover:border-[#f05123]/35 hover:bg-[#fffaf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35 focus-visible:ring-offset-2`}
      >
        <div className="relative h-full w-[84px] shrink-0 overflow-hidden bg-[#f3f4f6] sm:w-[92px]">
          <CourseCoverImage
            course={course}
            className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
          />
          <span className="absolute left-1.5 top-1.5 rounded-md bg-[#242424]/75 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            {statusLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3">
          <h3 className="line-clamp-1 text-sm font-bold leading-snug text-[#242424] transition-colors duration-200 group-hover:text-[#f05123]">
            {course.title}
          </h3>

          {showProgress ? (
            <div className="mt-1.5">
              <div className="mb-1 flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
                <span className="font-medium text-[#6b7280]">Tiến độ</span>
                <span className="font-semibold tabular-nums text-[#f05123]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[#fde8df]"
                role="progressbar"
                aria-label={`Tiến độ khóa học ${course.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPercent)}
              >
                <div
                  className="h-full rounded-full bg-[#f05123] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{
                    width: `${Math.min(100, Math.max(0, Math.round(progressPercent)))}%`,
                  }}
                />
              </div>
            </div>
          ) : course.description ? (
            <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-[#6b7280]">{course.description}</p>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="inline-flex min-w-0 items-center gap-1 truncate text-[10px] tabular-nums text-[#7c838d] sm:text-[11px]">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatDate(course.createdAt)}
            </span>
            <span
              className={
                enrolled
                  ? 'inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-[#f05123] px-2 text-[10px] font-semibold text-white sm:h-7 sm:px-2.5 sm:text-[11px]'
                  : 'inline-flex h-6 shrink-0 items-center rounded-md border border-[#e0e3e7] bg-white px-2 text-[10px] font-semibold text-[#4b5563] sm:h-7 sm:px-2.5 sm:text-[11px]'
              }
            >
              {enrolled ? (
                <>
                  <Play className="h-3 w-3" />
                  Tiếp tục
                </>
              ) : (
                'Chi tiết'
              )}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div
      className={`${className} min-w-0 overflow-hidden rounded-2xl transition duration-300 ${
        isTile
          ? 'bg-white ring-1 ring-[#f0f0f0] shadow-[0_1px_2px_rgba(36,36,36,0.04)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-18px_rgba(240,81,35,0.35)] hover:ring-[#f05123]/20 active:scale-[0.99]'
          : 'bg-[rgba(0,0,0,0.03)]'
      }`}
    >
      <Link
        to={`/courses/${course.slug}`}
        className="group relative block aspect-[276/155] overflow-hidden bg-[#f3f4f6]"
      >
        <CourseCoverImage course={course} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#242424]/55 via-transparent to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />
        <div className={`absolute flex ${isTile ? 'right-3 top-3' : 'inset-x-0 bottom-0 items-end p-4'}`}>
          <span
            className={`rounded-full font-semibold text-white backdrop-blur-md ${
              isTile
                ? 'bg-[#242424]/45 px-2.5 py-1 text-[10px] tracking-wide'
                : 'bg-black/25 px-2.5 py-1 text-[11px]'
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </Link>

      <div className={isTile ? 'px-4 pb-4 pt-3.5' : 'px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-[17px]'}>
        <h3 className={`line-clamp-2 font-bold leading-snug ${isTile ? 'text-[15px]' : 'text-[14px] sm:text-[16px]'}`}>
          <Link
            to={`/courses/${course.slug}`}
            className="text-[#292929] transition hover:text-[#f05123]"
          >
            {course.title}
          </Link>
        </h3>

        {course.description ? (
          <p
            className={`mt-2 line-clamp-2 leading-relaxed text-[#6b7280] ${
              isTile ? 'text-[12px]' : 'text-[12px] sm:text-[13px]'
            }`}
          >
            {course.description}
          </p>
        ) : null}

        <div
          className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#9ca3af] ${
            isTile ? 'text-[11px]' : 'text-[12px] sm:text-[13px]'
          }`}
        >
          {!isTile ? (
            <span className="inline-flex items-center gap-1 text-[#6b7280]">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              #{course.categoryId}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(course.createdAt)}
          </span>
        </div>

        {enrolled ? (
          <Link
            to={continueUrl}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f05123] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#e04a1f] sm:text-[13px]"
          >
            <Play className="h-3.5 w-3.5" />
            Tiếp tục học
          </Link>
        ) : null}
      </div>
    </div>
  )
}

interface CourseSectionProps {
  courses: Course[]
  maxRows?: number
}

export function CourseSection({ courses, maxRows = HOME_COURSE_ROWS_GRID }: CourseSectionProps) {
  const initialCount = HOME_COURSE_COLS * maxRows
  const [visibleCount, setVisibleCount] = useState(initialCount)

  useEffect(() => {
    setVisibleCount(initialCount)
  }, [courses, initialCount])

  const visibleCourses = courses.slice(0, visibleCount)
  const remaining = courses.length - visibleCount

  return (
    <div>
      <div className={COURSE_GRID_CLASS}>
        {visibleCourses.map((course) => (
          <CourseItem key={course.id} course={course} />
        ))}
      </div>
      {remaining > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount(courses.length)}
            className="h-[45px] rounded-full border border-[#f05123] bg-transparent px-6 text-[14px] font-semibold text-[#f05123] transition hover:bg-[#fff4ef]"
          >
            Xem thêm {remaining} khóa học
          </button>
        </div>
      ) : null}
    </div>
  )
}

interface CourseGridProps {
  courses: Course[]
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className={COURSE_GRID_CLASS_LOOSE}>
      {courses.map((course) => (
        <CourseItem key={course.id} course={course} className="w-full shrink" />
      ))}
    </div>
  )
}

export function CourseSkeletonGrid() {
  return (
    <div className={COURSE_GRID_BASE_CLASS}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.03)]">
          <div className="aspect-[276/155] bg-[#ebebeb]" />
          <div className="p-5">
            <div className="h-4 w-3/4 rounded bg-[#ebebeb]" />
            <div className="mt-3 h-3 w-full rounded bg-[#ebebeb]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseCompactSkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Đang tải khóa học">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[108px] animate-pulse overflow-hidden rounded-xl border border-[#ececec] bg-white"
        >
          <div className="h-full w-[84px] shrink-0 bg-[#ececec] sm:w-[92px]" />
          <div className="flex-1 p-3">
            <div className="h-3.5 w-2/3 rounded bg-[#ececec]" />
            <div className="mt-2 h-3 w-full rounded bg-[#f1f1f1]" />
            <div className="mt-6 h-3 w-20 rounded bg-[#ececec]" />
          </div>
        </div>
      ))}
    </div>
  )
}
