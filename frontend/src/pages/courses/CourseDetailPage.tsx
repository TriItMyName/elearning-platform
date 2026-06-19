import { useQuery } from '@tanstack/react-query'
import { BookOpen, Calendar, FolderOpen, Play, UserRound, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { chaptersApi } from '@/api/chapters.api'
import { useAuth } from '@/auth/auth.context'
import { CourseGrid } from '@/components/site/CourseItem'
import { Button } from '@/components/ui/Button'
import {
  useContinueLearnUrl,
  useCourseEnrollment,
  useCourseStudentCount,
  useEnrollCourse,
} from '@/hooks/useEnrollment'
import { useCourseBySlug, useCourses } from '@/hooks/useCourses'
import { notify } from '@/lib/notify'
import { COURSE_STATUS_LABEL } from '@/types/course'

export function CourseDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: coursesPage } = useCourses({ page: 0, size: 100 })
  const allCourses = coursesPage?.content ?? []
  const match = allCourses.find((item) => item.slug === slug)
  const { data: course, isLoading } = useCourseBySlug(slug, allCourses)

  const enrollmentQuery = useCourseEnrollment(match?.id ?? null)
  const studentCountQuery = useCourseStudentCount(match?.id ?? null)
  const enrolled = enrollmentQuery.data === true
  const enrollMutation = useEnrollCourse()
  const continueUrl = useContinueLearnUrl(course)

  const chaptersQuery = useQuery({
    queryKey: ['chapters', match?.id],
    queryFn: () => chaptersApi.listByCourse(match!.id, { page: 0, size: 100, sortBy: 'orderIndex' }),
    enabled: match != null,
  })

  const related = allCourses
    .filter((item) => item.slug !== slug && item.categoryId === match?.categoryId)
    .slice(0, 4)

  const handleEnroll = () => {
    if (!course) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${slug}` } })
      return
    }
    enrollMutation.mutate(course.id, {
      onSuccess: () => {
        notify.success('Đã ghi danh khóa học')
        navigate(`/learn/${slug}`)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1120px] animate-pulse gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="h-5 w-24 rounded bg-[#ececec]" />
          <div className="mt-4 h-8 w-2/3 rounded bg-[#e8e8e8]" />
          <div className="mt-8 h-32 rounded-xl bg-[#f0f0f0]" />
          <div className="mt-5 h-44 rounded-xl bg-[#f0f0f0]" />
        </div>
        <div className="h-[290px] rounded-2xl bg-[#ececec]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-[#242424]">Không tìm thấy khóa học</h1>
        <Link to="/courses" className="mt-4 inline-block text-sm font-semibold text-[#f05123] hover:underline">
          Xem danh sách khóa học
        </Link>
      </div>
    )
  }

  const chapters = chaptersQuery.data?.content ?? []
  const statusLabel = COURSE_STATUS_LABEL[course.status] ?? `Trạng thái ${course.status}`

  return (
    <div className="mx-auto max-w-[1120px] py-4 sm:py-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          <span className="inline-flex rounded-md bg-[#fff0eb] px-2.5 py-1 text-xs font-semibold text-[#d9481e]">
            {statusLabel}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
            {course.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6b7280]">
            <span className="inline-flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              {course.categoryName ?? `Danh mục #${course.categoryId}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {course.instructorName ?? `Giảng viên #${course.instructorId}`}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(course.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <section className="mt-6 rounded-xl bg-[#fafafa] p-4 sm:p-5" aria-labelledby="course-description-title">
            <h2 id="course-description-title" className="text-base font-bold text-[#242424]">
              Mô tả
            </h2>
            <p className="mt-2 max-w-[70ch] whitespace-pre-wrap text-sm leading-6 text-[#5f6670]">
              {course.description || 'Khóa học chưa có mô tả.'}
            </p>
          </section>

          <section className="mt-5" aria-labelledby="course-curriculum-title">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#f05123]" />
                <h2 id="course-curriculum-title" className="text-base font-bold text-[#242424]">
                  Chương trình học
                </h2>
              </div>
              <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[11px] font-semibold tabular-nums text-[#6b7280]">
                {chapters.length} chương
              </span>
            </div>

            {chaptersQuery.isLoading ? (
              <p className="mt-3 text-sm text-[#7c838d]" aria-live="polite">Đang tải chương...</p>
            ) : chapters.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-[#d9dde3] px-4 py-6 text-sm text-[#7c838d]">
                Chưa có chương nào được thêm.
              </p>
            ) : (
              <ol className="mt-3 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white divide-y divide-[#ececec]">
                {chapters.map((chapter, index) => (
                  <li key={chapter.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#fff0eb] text-[11px] font-bold tabular-nums text-[#d9481e]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-[#374151]">{chapter.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border border-[#e8e8e8] bg-white p-3 shadow-[0_10px_30px_-24px_rgba(36,36,36,0.35)] lg:sticky lg:top-20">
          <div className="aspect-video overflow-hidden rounded-xl bg-[#f1f2f4]">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={`Thumbnail khóa học ${course.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f05123] to-[#ff7849] text-sm font-semibold text-white">
                {course.title}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 py-4">
            <div className="rounded-lg bg-[#fafafa] px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-[#7c838d]">
                <Users className="h-3.5 w-3.5" /> Học viên
              </span>
              <strong className="mt-1 block text-sm tabular-nums text-[#242424]">
                {studentCountQuery.isLoading ? '...' : (studentCountQuery.data ?? 0)}
              </strong>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-[#7c838d]">
                <BookOpen className="h-3.5 w-3.5" /> Chương
              </span>
              <strong className="mt-1 block text-sm tabular-nums text-[#242424]">
                {chapters.length}
              </strong>
            </div>
          </div>

          {isAuthenticated && enrollmentQuery.isLoading ? (
            <Button className="w-full" disabled>Đang kiểm tra đăng ký...</Button>
          ) : isAuthenticated && enrolled ? (
            <Link to={continueUrl} className="block">
              <Button className="w-full">
                <Play className="mr-1.5 h-4 w-4" />
                {continueUrl.includes('lesson=') ? 'Tiếp tục học' : 'Vào học'}
              </Button>
            </Link>
          ) : (
            <Button className="w-full" onClick={handleEnroll} disabled={isAuthenticated && enrollMutation.isPending}>
              {isAuthenticated && enrollMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký khóa học'}
            </Button>
          )}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-8 border-t border-[#ececec] pt-6">
          <h2 className="mb-4 text-lg font-bold text-[#242424]">Khóa học cùng danh mục</h2>
          <CourseGrid courses={related} />
        </section>
      ) : null}
    </div>
  )
}
