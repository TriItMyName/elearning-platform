import { Link } from 'react-router-dom'

import { CourseGrid, CourseSkeletonGrid } from '@/components/site/CourseItem'
import { SectionHeading } from '@/components/site/SectionHeading'
import { HOME_SECTION_INSET_CLASS } from '@/constants/layout'
import { useCategories, useCourses } from '@/hooks/useCourses'

export function HomePage() {
  const { data: coursesPage, isLoading: coursesLoading } = useCourses({ page: 0, size: 20 })
  const { data: categoriesPage } = useCategories()
  const courses = coursesPage?.content ?? []
  const categories = categoriesPage?.content ?? []

  return (
    <div className="space-y-8 pb-4">
      <section className={`rounded-2xl bg-gradient-to-br from-[#fff4ef] via-white to-[#f0f7ff] px-6 py-10 sm:px-10 ${HOME_SECTION_INSET_CLASS}`}>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#f05123]">WebLearning</p>
        <h1 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-[#242424] sm:text-4xl">
          Học trực tuyến với khóa học được quản lý trực tiếp từ hệ thống
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#666]">
          Khám phá khóa học, xem chi tiết chương và bài học, quản lý nội dung qua API e-learning.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/courses"
            className="inline-flex rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e0481c]"
          >
            Khám phá khóa học
          </Link>
          <Link
            to="/my-courses"
            className="inline-flex rounded-full border border-[#e8e8e8] bg-white px-6 py-2.5 text-sm font-semibold text-[#292929] hover:bg-[#fafafa]"
          >
            Khóa học của tôi
          </Link>
        </div>
      </section>

      <div className={`space-y-8 ${HOME_SECTION_INSET_CLASS}`}>
        {categories.length > 0 ? (
          <section>
            <SectionHeading title="Danh mục" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/courses?category=${cat.id}`}
                  className="rounded-full border border-[#ebebeb] bg-white px-4 py-2 text-sm font-medium text-[#444] transition hover:border-[#f05123]/40 hover:text-[#f05123]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeading title="Khóa học mới" action={{ label: 'Xem tất cả >', to: '/courses' }} />
          {coursesLoading ? (
            <CourseSkeletonGrid />
          ) : courses.length > 0 ? (
            <CourseGrid courses={courses.slice(0, 10)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-14 text-center">
              <p className="text-[#666]">Chưa có khóa học nào. Giảng viên có thể tạo khóa học trong trang quản trị.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
