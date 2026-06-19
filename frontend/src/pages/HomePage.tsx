import { Link } from 'react-router-dom'
import { useMemo } from 'react'

import { CategoryCourseTile, CategoryCourseTileSkeleton } from '@/components/site/CategoryCourseTile'
import { HOME_SECTION_INSET_CLASS } from '@/constants/layout'
import { useCategories, useCourses } from '@/hooks/useCourses'
import { useEnrollmentProgressMap } from '@/hooks/useEnrollment'
import type { Category } from '@/types/category'
import type { Course } from '@/types/course'

function groupCoursesByCategory(courses: Course[], categories: Category[]) {
  const byCategoryId = new Map<number, Course[]>()

  for (const course of courses) {
    const list = byCategoryId.get(course.categoryId) ?? []
    list.push(course)
    byCategoryId.set(course.categoryId, list)
  }

  const sections = categories
    .map((category) => ({
      category,
      courses: byCategoryId.get(category.id) ?? [],
    }))
    .filter((section) => section.courses.length > 0)

  const knownCategoryIds = new Set(categories.map((category) => category.id))
  const orphanCourses = courses.filter((course) => !knownCategoryIds.has(course.categoryId))

  if (orphanCourses.length > 0) {
    sections.push({
      category: {
        id: 0,
        name: 'Khác',
        slug: 'khac',
        description: null,
      },
      courses: orphanCourses,
    })
  }

  return sections
}

export function HomePage() {
  const { data: coursesPage, isLoading: coursesLoading } = useCourses({ page: 0, size: 100 })
  const { data: categoriesPage, isLoading: categoriesLoading } = useCategories()
  const { progressMap: enrollmentProgress } = useEnrollmentProgressMap()
  const courses = coursesPage?.content ?? []
  const categories = categoriesPage?.content ?? []

  const categorySections = useMemo(
    () => groupCoursesByCategory(courses, categories),
    [courses, categories],
  )

  const isLoading = coursesLoading || categoriesLoading

  return (
    <div className="space-y-8 pb-4">
      <section className={`relative overflow-hidden rounded-2xl bg-[#fff8f5] px-6 py-10 sm:px-10 ${HOME_SECTION_INSET_CLASS}`}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f05123]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#f05123]/5 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f05123]">WebLearning</p>
          <h1 className="mt-3 max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] tracking-tight text-[#242424] sm:text-4xl">
            Học trực tuyến với khóa học được quản lý trực tiếp từ hệ thống
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#6b7280]">
            Khám phá khóa học theo danh mục, xem chi tiết chương và bài học, quản lý nội dung qua API e-learning.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(240,81,35,0.65)] transition duration-300 hover:bg-[#e0481c] active:scale-[0.98]"
            >
              Khám phá khóa học
            </Link>
            <Link
              to="/my-courses"
              className="inline-flex rounded-full border border-[#e8e8e8] bg-white px-6 py-2.5 text-sm font-semibold text-[#292929] transition duration-300 hover:bg-[#fafafa] active:scale-[0.98]"
            >
              Khóa học của tôi
            </Link>
          </div>
        </div>
      </section>

      <div className={`space-y-12 pb-6 ${HOME_SECTION_INSET_CLASS}`}>
        {isLoading ? (
          <>
            <CategoryCourseTileSkeleton />
            <CategoryCourseTileSkeleton />
          </>
        ) : categorySections.length > 0 ? (
          categorySections.map((section) => (
            <CategoryCourseTile
              key={section.category.id}
              category={section.category}
              courses={section.courses}
              enrollmentProgress={enrollmentProgress}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-14 text-center">
            <p className="text-[#666]">Chưa có khóa học nào. Giảng viên có thể tạo khóa học trong trang quản trị.</p>
          </div>
        )}
      </div>
    </div>
  )
}
