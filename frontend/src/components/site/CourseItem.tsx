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
  'from-[#1473e6] to-[#4da3ff]',
  'from-[#7c3aed] to-[#a78bfa]',
  'from-[#059669] to-[#34d399]',
  'from-[#db2777] to-[#f472b6]',
]

function courseGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length]
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
}

export function CourseItem({ course, className = 'w-full', enrolled = false }: CourseItemProps) {
  const statusLabel = COURSE_STATUS_LABEL[course.status] ?? `Trạng thái ${course.status}`
  const continueUrl = useContinueLearnUrl(enrolled ? course : null)

  return (
    <div className={`${className} min-w-0 overflow-hidden rounded-2xl bg-[rgba(0,0,0,0.03)]`}>
      <Link
        to={`/courses/${course.slug}`}
        className={`group relative block aspect-[276/155] overflow-hidden bg-gradient-to-br ${courseGradient(course.id)}`}
      >
        <div className="absolute inset-0 flex items-end p-4">
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {statusLabel}
          </span>
        </div>
      </Link>

      <div className="px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-[17px]">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug sm:text-[16px]">
          <Link to={`/courses/${course.slug}`} className="text-[#333] hover:text-[#f05123]">
            {course.title}
          </Link>
        </h3>

        {course.description ? (
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#666] sm:text-[13px]">
            {course.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#666] sm:text-[13px]">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            #{course.categoryId}
          </span>
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
