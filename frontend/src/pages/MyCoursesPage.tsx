import { Award, BarChart3, BookOpen, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import {
  CourseCompactSkeletonGrid,
  CourseItem,
} from '@/components/site/CourseItem'
import { useEnrolledCourses } from '@/hooks/useEnrollment'
import { useMyCourses } from '@/hooks/useCourses'

export function MyCoursesPage() {
  const { isAuthenticated, canAccessTeacher, managementPath } = useAuth()
  const { courses: enrolledCourses, isLoading: enrolledLoading } = useEnrolledCourses()
  const { data: teachingPage, isLoading: teachingLoading } = useMyCourses({ page: 0, size: 50 })
  const teachingCourses = teachingPage?.content ?? []

  if (!isAuthenticated) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-2xl border border-[#e8e8e8] bg-[#fafafa] px-6 py-10 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[#f05123]">
          <BookOpen className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#242424]">
          Đăng nhập để xem khóa học
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          Theo dõi các khóa đang học và tiếp tục từ bài gần nhất.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-[#f05123] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#e04a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35 focus-visible:ring-offset-2"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1120px] py-4 sm:py-6">
      <header className="flex flex-col gap-4 border-b border-[#ececec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#242424]">Khóa học của tôi</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Tiếp tục học hoặc quản lý các khóa học của bạn.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#4b5563]">
          <span className="rounded-lg bg-[#fff1ec] px-3 py-1.5">
            <strong className="tabular-nums text-[#d9481e]">{enrolledCourses.length}</strong>{' '}
            đang học
          </span>
          <Link
            to="/my-certificates"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ececec] bg-white px-3 py-1.5 font-semibold text-[#374151] transition-colors duration-200 hover:border-[#f05123]/35 hover:text-[#f05123] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35"
          >
            <Award className="h-3.5 w-3.5" />
            Chứng chỉ
          </Link>
          <Link
            to="/my-progress"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ececec] bg-white px-3 py-1.5 font-semibold text-[#374151] transition-colors duration-200 hover:border-[#f05123]/35 hover:text-[#f05123] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Tiến độ học tập
          </Link>
          {canAccessTeacher ? (
            <span className="rounded-lg bg-[#f3f4f6] px-3 py-1.5">
              <strong className="tabular-nums text-[#242424]">{teachingCourses.length}</strong>{' '}
              giảng dạy
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-5 space-y-5">
        <section
          aria-labelledby="enrolled-courses-title"
          className="rounded-2xl bg-[#fafafa] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#f05123]" />
                <h2 id="enrolled-courses-title" className="text-base font-bold text-[#242424]">
                  Đang học
                </h2>
                <span className="rounded-md bg-[#f3f4f6] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#6b7280]">
                  {enrolledCourses.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#7c838d]">Các khóa học bạn đã ghi danh.</p>
            </div>
            <Link
              to="/courses"
              className="rounded-md text-xs font-semibold text-[#f05123] transition-colors duration-200 hover:text-[#d9481e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35"
            >
              Khám phá thêm
            </Link>
          </div>

          {enrolledLoading ? (
            <div className="mt-4" aria-live="polite">
              <CourseCompactSkeletonGrid />
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-dashed border-[#d9dde3] bg-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#374151]">Bạn chưa ghi danh khóa học nào.</p>
                <p className="mt-1 text-xs text-[#7c838d]">Chọn một khóa học để bắt đầu.</p>
              </div>
              <Link
                to="/courses"
                className="inline-flex h-8 items-center justify-center self-start rounded-lg bg-[#f05123] px-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#e04a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35 focus-visible:ring-offset-2 sm:self-auto"
              >
                Khám phá khóa học
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseItem
                  key={course.id}
                  course={course}
                  enrolled
                  progressPercent={course.enrollmentProgress}
                  variant="compact"
                />
              ))}
            </div>
          )}
        </section>

        {canAccessTeacher ? (
          <section
            aria-labelledby="teaching-courses-title"
            className="rounded-2xl bg-[#fafafa] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#f05123]" />
                  <h2 id="teaching-courses-title" className="text-base font-bold text-[#242424]">
                    Đang giảng dạy
                  </h2>
                  <span className="rounded-md bg-[#f3f4f6] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#6b7280]">
                    {teachingCourses.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#7c838d]">Các khóa học bạn tạo hoặc quản lý.</p>
              </div>
              <Link
                to={managementPath === '/admin' ? '/admin/courses' : '/teacher'}
                className="rounded-md text-xs font-semibold text-[#f05123] transition-colors duration-200 hover:text-[#d9481e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35"
              >
                Mở trang quản lý
              </Link>
            </div>

            {teachingLoading ? (
              <div className="mt-4" aria-live="polite">
                <CourseCompactSkeletonGrid />
              </div>
            ) : teachingCourses.length === 0 ? (
              <div className="mt-4 flex flex-col gap-4 rounded-xl border border-dashed border-[#d9dde3] bg-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Chưa có khóa học giảng dạy.</p>
                  <p className="mt-1 text-xs text-[#7c838d]">Tạo khóa học đầu tiên trong trang quản lý.</p>
                </div>
                <Link
                  to={managementPath === '/admin' ? '/admin/courses' : '/teacher'}
                  className="inline-flex h-8 items-center justify-center self-start rounded-lg border border-[#d1d5db] bg-white px-3 text-xs font-semibold text-[#374151] transition-colors duration-200 hover:bg-[#f3f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35 sm:self-auto"
                >
                  Tạo khóa học
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {teachingCourses.map((course) => (
                  <CourseItem key={course.id} course={course} variant="compact" />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}
