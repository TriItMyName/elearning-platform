import { BookOpen, Calendar, FolderOpen, Play } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { chaptersApi } from '@/api/chapters.api'
import { CourseGrid } from '@/components/site/CourseItem'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/auth.context'
import { COURSE_STATUS_LABEL } from '@/types/course'
import { useCourseBySlug, useCourses } from '@/hooks/useCourses'
import {
  useContinueLearnUrl,
  useCourseEnrollment,
  useEnrollCourse,
} from '@/hooks/useEnrollment'
import { notify } from '@/lib/notify'

export function CourseDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { data: coursesPage } = useCourses({ page: 0, size: 100 })
  const allCourses = coursesPage?.content ?? []
  const match = allCourses.find((c) => c.slug === slug)
  const { data: course, isLoading } = useCourseBySlug(slug, allCourses)

  const enrollmentQuery = useCourseEnrollment(match?.id ?? null)
  const enrolled = enrollmentQuery.data === true
  const enrollMutation = useEnrollCourse()
  const continueUrl = useContinueLearnUrl(course)

  const chaptersQuery = useQuery({
    queryKey: ['chapters', match?.id],
    queryFn: () => chaptersApi.listByCourse(match!.id, { page: 0, size: 100, sortBy: 'orderIndex' }),
    enabled: match != null,
  })

  const related = allCourses.filter((c) => c.slug !== slug && c.categoryId === match?.categoryId).slice(0, 4)

  const handleEnroll = () => {
    if (!course) return
    enrollMutation.mutate(course.id, {
      onSuccess: () => {
        notify.success('Đã ghi danh khóa học')
        navigate(`/learn/${slug}`)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-8 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy khóa học</h1>
        <Link to="/courses" className="mt-4 inline-block text-[#f05123] hover:underline">
          Xem danh sách khóa học
        </Link>
      </div>
    )
  }

  const chapters = chaptersQuery.data?.content ?? []
  const statusLabel = COURSE_STATUS_LABEL[course.status] ?? `Trạng thái ${course.status}`

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#f0f0f0]">
        <div className="relative bg-gradient-to-br from-[#f05123] to-[#ff7849] px-6 py-14 sm:px-10 sm:py-16">
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
            {statusLabel}
          </span>
          <h1 className="mt-4 max-w-3xl text-2xl font-bold text-white sm:text-4xl">{course.title}</h1>
          {course.description ? (
            <p className="mt-4 max-w-2xl text-white/90">{course.description}</p>
          ) : null}
        </div>

        <div className="grid gap-6 p-6 sm:p-8">
          <div className="flex flex-wrap gap-4 text-sm text-[#666]">
            <span className="inline-flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              Danh mục #{course.categoryId}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Giảng viên #{course.instructorId}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(course.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <Link to="/login" state={{ from: `/learn/${slug}` }}>
                <Button>Đăng nhập để học</Button>
              </Link>
            ) : enrollmentQuery.isLoading ? (
              <Button disabled>Đang kiểm tra ghi danh...</Button>
            ) : enrolled ? (
              <Link to={continueUrl}>
                <Button>
                  <Play className="mr-1.5 h-4 w-4" />
                  {continueUrl.includes('lesson=') ? 'Tiếp tục học' : 'Vào học'}
                </Button>
              </Link>
            ) : (
              <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                {enrollMutation.isPending ? 'Đang ghi danh...' : 'Ghi danh khóa học'}
              </Button>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#242424]">Chương học</h2>
            {chaptersQuery.isLoading ? (
              <p className="mt-3 text-sm text-[#999]">Đang tải chương...</p>
            ) : chapters.length === 0 ? (
              <p className="mt-3 text-sm text-[#999]">Chưa có chương nào được thêm.</p>
            ) : (
              <ol className="mt-4 space-y-2">
                {chapters.map((chapter, index) => (
                  <li
                    key={chapter.id}
                    className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] px-4 py-3 text-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff4f0] text-xs font-bold text-[#f05123]">
                      {index + 1}
                    </span>
                    <span className="font-medium text-[#333]">{chapter.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-bold text-[#242424]">Khóa học cùng danh mục</h2>
          <CourseGrid courses={related} />
        </section>
      ) : null}
    </div>
  )
}
