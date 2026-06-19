import { BarChart3, BookOpenCheck, Brain, Loader2, Play } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { CourseProgressBars } from '@/components/student/progress/CourseProgressBars'
import { ProgressSummaryPanel } from '@/components/student/progress/ProgressSummaryPanel'
import { useProgressPageEnter } from '@/components/student/progress/progress-motion'
import { useStudentProgressOverview } from '@/hooks/useStudentProgress'
import { cn } from '@/lib/utils'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function courseGradient(id: number) {
  const gradients = [
    'from-[#f05123] to-[#ff7849]',
    'from-[#ea580c] to-[#fb923c]',
    'from-[#78716c] to-[#a8a29e]',
  ]
  return gradients[id % gradients.length]
}

export function StudentProgressPage() {
  const { isAuthenticated } = useAuth()
  const pageRef = useRef<HTMLDivElement>(null)
  const progressQuery = useStudentProgressOverview(isAuthenticated)
  const ready = progressQuery.isSuccess && !progressQuery.isFetching

  useProgressPageEnter(pageRef, ready)

  if (!isAuthenticated) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-2xl border border-[#e8e8e8] bg-[#fafafa] px-6 py-10 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[#f05123]">
          <BarChart3 className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#242424]">Đăng nhập để xem tiến độ</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          Theo dõi mức hoàn thành từng khóa và điểm quiz trung bình của bạn.
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

  const data = progressQuery.data
  const courses = data?.courses ?? []

  return (
    <div ref={pageRef} className="mx-auto max-w-[1120px] py-4 sm:py-6">
      <header
        data-progress-item
        className="flex flex-col gap-4 border-b border-[#ececec] pb-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f05123]">Học tập</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#242424]">Tiến độ học tập</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Biểu đồ hoàn thành từng khóa và điểm quiz trung bình của bạn.
          </p>
        </div>
        <Link
          to="/my-courses"
          className="inline-flex h-9 items-center self-start rounded-lg border border-[#e8e8e8] bg-white px-3.5 text-sm font-semibold text-[#374151] transition-colors duration-200 hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05123]/35 sm:self-auto"
        >
          Khóa học của tôi
        </Link>
      </header>

      {progressQuery.isLoading ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-[#6b7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#f05123]" aria-hidden />
          <p className="text-sm">Đang tải tiến độ học tập...</p>
        </div>
      ) : progressQuery.isError ? (
        <div className="mt-8 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-5 py-8 text-center text-sm text-[#be123c]">
          Không tải được dữ liệu tiến độ. Vui lòng thử lại sau.
        </div>
      ) : data ? (
        <div className="mt-6 space-y-6">
          <ProgressSummaryPanel
            overallProgress={data.overallProgress}
            completedCourses={data.completedCourses}
            totalCourses={data.totalCourses}
            averageQuizScore={data.averageQuizScore}
            totalQuizAttempts={data.totalQuizAttempts}
            completedLessons={data.completedLessons}
            totalLessons={data.totalLessons}
            ready={ready}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <section
              data-progress-item
              className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ec] text-[#f05123]">
                  <BookOpenCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#242424]">Hoàn thành từng khóa</h2>
                  <p className="mt-1 text-sm text-[#6b7280]">Tiến độ bài học theo từng khóa đã ghi danh.</p>
                </div>
              </div>
              <CourseProgressBars courses={courses} metric="completion" ready={ready} />
            </section>

            <section
              data-progress-item
              className="rounded-2xl border border-[#ececec] bg-white p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#374151]">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#242424]">Điểm quiz trung bình</h2>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Điểm trung bình các lần làm quiz trong mỗi khóa.
                  </p>
                </div>
              </div>
              <CourseProgressBars courses={courses} metric="quiz" ready={ready} />
            </section>
          </div>

          <section data-progress-item className="rounded-2xl bg-[#fafafa] p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#242424]">Chi tiết khóa học</h2>
              <p className="mt-1 text-xs text-[#7c838d]">Tiếp tục học hoặc xem lại tiến độ từng khóa.</p>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9dde3] bg-white px-5 py-8 text-center">
                <p className="text-sm font-semibold text-[#374151]">Bạn chưa ghi danh khóa học nào.</p>
                <Link
                  to="/courses"
                  className="mt-4 inline-flex h-8 items-center rounded-lg bg-[#f05123] px-3 text-xs font-semibold text-white hover:bg-[#e04a1f]"
                >
                  Khám phá khóa học
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {courses.map((course) => (
                  <article
                    key={course.courseId}
                    className="flex overflow-hidden rounded-xl border border-[#e8e8e8] bg-white transition-colors duration-200 hover:border-[#f05123]/35"
                  >
                    <div className="relative h-auto w-24 shrink-0 sm:w-28">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="h-full min-h-[112px] w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={cn(
                            'min-h-[112px] h-full w-full bg-gradient-to-br',
                            courseGradient(course.courseId),
                          )}
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5 sm:p-4">
                      <div>
                        <h3 className="line-clamp-2 text-sm font-bold text-[#242424]">{course.courseTitle}</h3>
                        <p className="mt-1 text-xs text-[#7c838d]">
                          Hoạt động gần nhất: {formatDate(course.lastActivityAt)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                          <span className="rounded-md bg-[#fff1ec] px-2 py-0.5 text-[#d9481e]">
                            {Math.round(course.progress)}% hoàn thành
                          </span>
                          <span className="rounded-md bg-[#f3f4f6] px-2 py-0.5 text-[#374151]">
                            {course.quizAttempts > 0
                              ? `Quiz TB ${Math.round(course.averageQuizScore)}`
                              : 'Chưa làm quiz'}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/learn/${course.courseSlug}`}
                        className="mt-3 inline-flex h-8 w-fit items-center rounded-lg bg-[#f05123] px-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#e04a1f]"
                      >
                        <Play className="mr-1 h-3.5 w-3.5" />
                        Tiếp tục học
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
