import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourseItem, CourseSkeletonGrid } from '@/components/site/CourseItem'
import { useAuth } from '@/auth/auth.context'
import { useEnrolledCourses } from '@/hooks/useEnrollment'
import { useMyCourses } from '@/hooks/useCourses'

export function MyCoursesPage() {
  const { isAuthenticated, canAccessTeacher, managementPath } = useAuth()
  const { courses: enrolledCourses, isLoading: enrolledLoading } = useEnrolledCourses()
  const { data: teachingPage, isLoading: teachingLoading } = useMyCourses({ page: 0, size: 50 })
  const teachingCourses = teachingPage?.content ?? []

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-[#ccc]" />
        <h1 className="mt-4 text-xl font-bold">Đăng nhập để xem khóa học của bạn</h1>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold text-[#242424] sm:text-3xl">Khóa học đang học</h1>
        <p className="mt-2 text-[#666]">Các khóa học bạn đã ghi danh.</p>

        {enrolledLoading ? (
          <div className="mt-8">
            <CourseSkeletonGrid />
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-14 text-center">
            <p className="text-[#666]">Bạn chưa ghi danh khóa học nào.</p>
            <Link to="/courses" className="mt-4 inline-block text-sm font-semibold text-[#f05123] hover:underline">
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseItem key={course.id} course={course} enrolled />
            ))}
          </div>
        )}
      </section>

      {canAccessTeacher ? (
        <section>
          <h2 className="text-xl font-bold text-[#242424]">Khóa học giảng dạy</h2>
          <p className="mt-2 text-[#666]">Các khóa học bạn tạo hoặc quản lý.</p>

          {teachingLoading ? (
            <div className="mt-8">
              <CourseSkeletonGrid />
            </div>
          ) : teachingCourses.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-10 text-center">
              <p className="text-[#666]">Chưa có khóa học giảng dạy.</p>
              <Link
                to={managementPath === '/admin' ? '/admin/courses' : '/teacher'}
                className="mt-4 inline-block text-sm font-semibold text-[#f05123] hover:underline"
              >
                Tạo khóa học trong quản trị
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {teachingCourses.map((course) => (
                <CourseItem key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
