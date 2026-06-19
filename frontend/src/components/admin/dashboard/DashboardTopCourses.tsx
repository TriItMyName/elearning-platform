import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import type { DashboardTopCourse } from '@/types/dashboard'

interface DashboardTopCoursesProps {
  courses: DashboardTopCourse[]
}

export function DashboardTopCourses({ courses }: DashboardTopCoursesProps) {
  const maxEnrollments = Math.max(...courses.map((c) => c.enrollments), 1)

  return (
    <div data-dashboard-item className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Top khóa học</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Theo lượt ghi danh và tỷ lệ hoàn thành</p>
        </div>
        <Link
          to="/admin/courses"
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#f05123] transition hover:underline"
        >
          Xem khóa học <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="space-y-4">
        {courses.map((course, index) => (
          <li key={course.courseId}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium text-[#374151]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f9fafb] text-xs font-bold text-[#9ca3af]">
                  {index + 1}
                </span>
                <span className="truncate">{course.title}</span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-[#6b7280]">
                {course.enrollments} HV · {course.completionRate}%
              </span>
            </div>
            <div className="flex gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f05123] to-[#ff7849] transition-all duration-700"
                  style={{ width: `${(course.enrollments / maxEnrollments) * 100}%` }}
                />
              </div>
              <div className="h-2 w-16 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-[#2563eb]/70"
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
