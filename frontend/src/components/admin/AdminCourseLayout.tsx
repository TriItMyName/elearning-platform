import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, HelpCircle, Image as ImageIcon, Pencil, Trash2, Video } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import { AdminCard } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { CourseFormModal, CourseStatusBadge } from '@/pages/admin/courses/AdminCoursesPage'
import type { AdminCourse } from '@/types/admin-course'

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [editOpen, setEditOpen] = useState(false)
  const courseId = Number(rawCourseId)

  const courseQuery = useQuery({
    queryKey: ['admin', 'courses', courseId],
    queryFn: () => adminApi.courses.getById(courseId),
    enabled: !Number.isNaN(courseId),
  })

  const course = courseQuery.data

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.categories.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.courses.delete(courseId),
    onSuccess: async () => {
      notify.success('Đã chuyển khóa học vào thùng rác')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      navigate('/admin/courses')
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

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
          <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:items-start">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f3f4f6]">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={`Thumbnail khóa học ${course.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[#9ca3af]">
                  <ImageIcon className="h-7 w-7" />
                  <span className="text-xs font-medium">Chưa có thumbnail</span>
                </div>
              )}
              <div className="absolute left-2.5 top-2.5 shadow-sm">
                <CourseStatusBadge status={course.adminStatus} />
              </div>
            </div>
            <div className="min-w-0 py-1">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#9ca3af] uppercase">
                Quản lý nội dung khóa học
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#111827]">{course.title}</h1>
              {course.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                  {course.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Sửa khóa học
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Chuyển vào thùng rác',
                    description: `Khóa học "${course.title}" sẽ được ẩn khỏi danh sách hoạt động.`,
                    confirmLabel: 'Chuyển vào thùng rác',
                  })
                  if (ok) deleteMutation.mutate()
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Xóa
              </Button>
            </div>
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
      {course && editOpen ? (
        <CourseFormModal
          open
          title={`Sửa: ${course.title}`}
          onClose={() => setEditOpen(false)}
          mode="edit"
          initial={course}
          categories={categoriesQuery.data?.content ?? []}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}
