import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, HelpCircle, Video } from 'lucide-react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import { AdminCard } from '@/components/admin/AdminUi'
import { cn } from '@/lib/utils'
import type { AdminCourse } from '@/types/admin-course'
import { ADMIN_COURSE_STATUS_LABEL } from '@/types/admin-course'

export type AdminCourseOutletContext = {
  course: AdminCourse | undefined
  isCourseLoading: boolean
}

const COURSE_TABS = [
  { segment: 'lessons', label: 'Chương & bài học', icon: Video },
  { segment: 'quizzes', label: 'Quiz', icon: HelpCircle },
] as const

export function AdminCourseLayout() {
  const { courseId: rawCourseId } = useParams()
  const courseId = Number(rawCourseId)

  const courseQuery = useQuery({
    queryKey: ['admin', 'courses', courseId],
    queryFn: () => adminApi.courses.getById(courseId),
    enabled: !Number.isNaN(courseId),
  })

  const course = courseQuery.data

  return (
    <div>
      <Link
        to="/admin/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#111827]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách khóa học
      </Link>

      <AdminCard className="mb-4" padding>
        {courseQuery.isLoading ? (
          <p className="text-sm text-[#6b7280]">Đang tải khóa học...</p>
        ) : course ? (
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#9ca3af] uppercase">
              Quản lý nội dung khóa học
            </p>
            <h1 className="mt-1 text-xl font-bold text-[#111827]">{course.title}</h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              {ADMIN_COURSE_STATUS_LABEL[course.adminStatus]} · {course.slug}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">Không tìm thấy khóa học.</p>
        )}
      </AdminCard>

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-[#e8e8e8] bg-white p-1.5">
        {COURSE_TABS.map(({ segment, label, icon: Icon }) => (
          <NavLink
            key={segment}
            to={`/admin/courses/${courseId}/${segment}`}
            className={({ isActive }) =>
              cn(
                'inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-[#f05123] text-white shadow-sm'
                  : 'text-[#6b7280] hover:bg-[#f8f8f8] hover:text-[#111827]',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ course, isCourseLoading: courseQuery.isLoading } satisfies AdminCourseOutletContext} />
    </div>
  )
}
