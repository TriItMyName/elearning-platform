import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourseItem } from '@/components/site/CourseItem'
import type { Category } from '@/types/category'
import type { Course } from '@/types/course'

interface CategoryCourseTileProps {
  category: Category
  courses: Course[]
  maxCourses?: number
}

export function CategoryCourseTile({ category, courses, maxCourses = 10 }: CategoryCourseTileProps) {
  const visibleCourses = courses.slice(0, maxCourses)
  const hasMore = courses.length > maxCourses

  return (
    <section className="relative">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#ececec] pb-5">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden
            className="mt-1.5 h-9 w-1 shrink-0 rounded-full bg-[#f05123] shadow-[0_0_0_4px_rgba(240,81,35,0.12)]"
          />
          <div className="min-w-0">
            <h2 className="text-balance text-2xl font-extrabold tracking-tight text-[#242424] sm:text-[28px]">
              {category.name}
            </h2>
            {category.description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#6b7280] sm:text-[15px]">
                {category.description}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-[#9ca3af]">
                <span className="font-semibold text-[#525252]">{courses.length}</span> khóa học
              </p>
            )}
          </div>
        </div>

        <Link
          to={`/courses?category=${category.id}`}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-1 py-1 text-sm font-semibold text-[#f05123] transition hover:text-[#e0481c] active:scale-[0.98]"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative -mx-1">
        <div className="flex gap-4 overflow-x-auto px-1 pb-1 scrollbar-thin snap-x snap-mandatory">
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className="w-[min(82vw,280px)] shrink-0 snap-start sm:w-[272px]"
            >
              <CourseItem course={course} variant="tile" />
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-14"
        />
      </div>

      {hasMore ? (
        <div className="mt-5 flex justify-start sm:mt-6">
          <Link
            to={`/courses?category=${category.id}`}
            className="inline-flex h-10 items-center rounded-full border border-[#f05123]/35 bg-[#fff8f5] px-5 text-sm font-semibold text-[#f05123] transition duration-300 hover:border-[#f05123] hover:bg-[#fff4ef] active:scale-[0.98]"
          >
            Xem thêm {courses.length - maxCourses} khóa học
          </Link>
        </div>
      ) : null}
    </section>
  )
}

export function CategoryCourseTileSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#ececec] pb-5">
        <div className="flex items-start gap-3.5">
          <div className="mt-1.5 h-9 w-1 rounded-full bg-[#ebebeb]" />
          <div>
            <div className="h-7 w-40 rounded-lg bg-[#ebebeb] sm:w-52" />
            <div className="mt-2 h-4 w-28 rounded bg-[#ebebeb]" />
          </div>
        </div>
        <div className="h-4 w-20 rounded bg-[#ebebeb]" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-[min(82vw,280px)] shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-[#f0f0f0] sm:w-[272px]"
          >
            <div className="aspect-[276/155] bg-[#ebebeb]" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-[#ebebeb]" />
              <div className="h-3 w-full rounded bg-[#ebebeb]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
