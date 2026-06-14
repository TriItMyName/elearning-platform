import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CourseItem, CourseSkeletonGrid } from '@/components/site/CourseItem'
import { useAuth } from '@/auth/auth.context'
import { useMyCourses } from '@/hooks/useCourses'

export function MyCoursesPage() {
  const { isAuthenticated } = useAuth()
  const { data: coursesPage, isLoading } = useMyCourses({ page: 0, size: 50 })
  const courses = coursesPage?.content ?? []

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
    <div>
      <h1 className="text-2xl font-bold text-[#242424] sm:text-3xl">Khóa học của tôi</h1>
      <p className="mt-2 text-[#666]">Các khóa học bạn đang giảng dạy hoặc quản lý.</p>

      {isLoading ? (
        <div className="mt-8">
          <CourseSkeletonGrid />
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-14 text-center">
          <p className="text-[#666]">Bạn chưa có khóa học nào.</p>
          <Link to="/admin/courses" className="mt-4 inline-block text-sm font-semibold text-[#f05123] hover:underline">
            Tạo khóa học trong quản trị
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
