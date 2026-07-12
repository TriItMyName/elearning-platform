import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CourseGrid, CourseSkeletonGrid } from '@/components/site/CourseItem'
import { SectionHeading } from '@/components/site/SectionHeading'
import { useCategories, useCourses } from '@/hooks/useCourses'
import { useEnrollmentProgressMap } from '@/hooks/useEnrollment'

export function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const { data: coursesPage, isLoading } = useCourses({ page: 0, size: 100 })
  const { data: categoriesPage } = useCategories()
  const { progressMap: enrollmentProgress } = useEnrollmentProgressMap()

  const courses = coursesPage?.content ?? []
  const categories = categoriesPage?.content ?? []

  const filtered = useMemo(() => {
    if (!categoryFilter) return courses
    const id = Number(categoryFilter)
    if (Number.isNaN(id)) return courses
    return courses.filter((c) => c.categoryId === id)
  }, [courses, categoryFilter])

  return (
    <div className="space-y-8 pb-4">
      <SectionHeading title="Khóa học" />

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              !categoryFilter
                ? 'bg-[#f05123] text-white'
                : 'border border-[#ebebeb] bg-white text-[#444] hover:border-[#f05123]/40',
            ].join(' ')}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSearchParams({ category: String(cat.id) })}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                categoryFilter === String(cat.id)
                  ? 'bg-[#f05123] text-white'
                  : 'border border-[#ebebeb] bg-white text-[#444] hover:border-[#f05123]/40',
              ].join(' ')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <CourseSkeletonGrid />
      ) : filtered.length > 0 ? (
        <CourseGrid courses={filtered} enrollmentProgress={enrollmentProgress} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-14 text-center text-[#666]">
          Không có khóa học phù hợp bộ lọc.
        </div>
      )}
    </div>
  )
}
