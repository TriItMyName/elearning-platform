import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom'

import { quizStudentApi } from '@/api/quiz-student.api'
import type { LearnLayoutContext } from '@/components/learn/LearnLayout'
import { LearnSidebar } from '@/components/learn/LearnSidebar'
import { QuizPlayer } from '@/components/learn/QuizPlayer'
import { UploadedVideoPlayer } from '@/components/learn/UploadedVideoPlayer'
import { VideoLessonPlayer } from '@/components/learn/VideoLessonPlayer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/auth/auth.context'
import { useCourseEnrollment, useEnrollCourse } from '@/hooks/useEnrollment'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import {
  useLearnCourse,
  useMarkLessonComplete,
  useQuizAttemptedLessonIds,
} from '@/hooks/useLearn'
import { useCourses } from '@/hooks/useCourses'
import { parseVideoEmbed } from '@/lib/video-embed'
import { setLastLessonId } from '@/lib/learn-progress.storage'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { LearnLesson } from '@/types/learn'
import type { SubmitQuizResult } from '@/types/quiz-student'

export function LearnPage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useOutletContext<LearnLayoutContext>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { confirm, ConfirmDialogHost } = useConfirmDialog()

  const { data: coursesPage } = useCourses({ page: 0, size: 100 })
  const courseMeta = coursesPage?.content.find((c) => c.slug === slug)
  const enrollmentQuery = useCourseEnrollment(courseMeta?.id ?? null)
  const enrolled = enrollmentQuery.data === true

  const queryClient = useQueryClient()
  const { data: course, isLoading, isError } = useLearnCourse(slug, { enabled: enrolled })
  const quizAttemptedLessonIds = useQuizAttemptedLessonIds(course, { enabled: enrolled })
  const enrollMutation = useEnrollCourse()
  const completeMutation = useMarkLessonComplete(slug)

  const [activeLesson, setActiveLesson] = useState<LearnLesson | null>(null)
  const [viewMode, setViewMode] = useState<'lesson' | 'quiz'>('lesson')
  const [quizHasDraftAnswers, setQuizHasDraftAnswers] = useState(false)

  const allLessons = useMemo(
    () => course?.chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterId: ch.id }))) ?? [],
    [course],
  )

  const activeIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null

  useEffect(() => {
    if (!course || allLessons.length === 0 || !user) return
    const lessonParam = Number(searchParams.get('lesson'))
    const found =
      allLessons.find((l) => l.id === lessonParam) ??
      allLessons.find((l) => !l.completed) ??
      allLessons[0]
    setActiveLesson(found)
    setViewMode(searchParams.get('quiz') === '1' && found.hasQuiz ? 'quiz' : 'lesson')
    setLastLessonId(user.id, course.id, found.id)
  }, [course, allLessons, searchParams, user])

  const quizQuery = useQuery({
    queryKey: ['quiz-student', course?.id, activeLesson?.chapterId, activeLesson?.id],
    queryFn: () => quizStudentApi.getByLesson(course!.id, activeLesson!.chapterId, activeLesson!.id),
    enabled: viewMode === 'quiz' && activeLesson != null && course != null,
  })

  const selectLesson = (lesson: LearnLesson, quiz = false, replaceHistory = true) => {
    setActiveLesson(lesson)
    setViewMode(quiz && lesson.hasQuiz ? 'quiz' : 'lesson')
    setSearchParams(
      { lesson: String(lesson.id), ...(quiz && lesson.hasQuiz ? { quiz: '1' } : {}) },
      { replace: replaceHistory },
    )
    if (user && course) setLastLessonId(user.id, course.id, lesson.id)
    setSidebarOpen(false)
  }

  const openQuiz = (lesson: LearnLesson) => {
    setQuizHasDraftAnswers(false)
    selectLesson(lesson, true, false)
  }

  const backToLesson = async (lesson: LearnLesson) => {
    if (quizHasDraftAnswers) {
      const shouldLeave = await confirm({
        title: 'Quay lại bài học?',
        description:
          'Bạn đang có câu trả lời. Nếu quay lại bài học, các câu trả lời đã chọn sẽ bị mất.',
        confirmLabel: 'Quay lại',
        cancelLabel: 'Tiếp tục làm quiz',
      })
      if (!shouldLeave) return
    }

    setQuizHasDraftAnswers(false)
    selectLesson(lesson)
  }

  const completeActiveLesson = (advanceToNextLesson: boolean) => {
    if (!course || !activeLesson) return
    completeMutation.mutate(
      { courseId: course.id, lessonId: activeLesson.id },
      {
        onSuccess: () => {
          notify.success('Đã đánh dấu hoàn thành bài học')
          if (advanceToNextLesson && nextLesson && !nextLesson.completed) {
            selectLesson(nextLesson)
          }
        },
      },
    )
  }

  const handleLessonComplete = () => completeActiveLesson(false)

  const handleQuizComplete = (result: SubmitQuizResult) => {
    if (!course || !activeLesson) return
    void queryClient.invalidateQueries({
      queryKey: ['quiz-attempts', course.id, activeLesson.chapterId, activeLesson.id],
    })
    if (result.passed) completeActiveLesson(false)
  }

  const handleEnroll = () => {
    if (!courseMeta) return
    enrollMutation.mutate(courseMeta.id, {
      onSuccess: () => notify.success('Đã ghi danh khóa học'),
    })
  }

  if (enrollmentQuery.isLoading || (enrolled && isLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#999]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải khóa học...
      </div>
    )
  }

  if (!courseMeta) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Không tìm thấy khóa học</h1>
        <Link to="/courses" className="mt-4 inline-block text-[#f05123] hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  if (!enrolled) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-[#242424]">{courseMeta.title}</h1>
        <p className="mt-3 text-[#666]">Bạn cần ghi danh khóa học trước khi bắt đầu học.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
            {enrollMutation.isPending ? 'Đang ghi danh...' : 'Ghi danh và bắt đầu học'}
          </Button>
          <Link to={`/courses/${slug}`}>
            <Button variant="secondary">Xem chi tiết khóa học</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Không tải được nội dung học</h1>
        <Link to={`/courses/${slug}`} className="mt-4 inline-block text-[#f05123] hover:underline">
          Quay lại chi tiết khóa học
        </Link>
      </div>
    )
  }

  const completedCount = course.completedLessonIds.length
  const totalLessons = allLessons.length
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
      <div className="mb-5 max-w-sm">
        <h1 className="text-xl font-bold text-[#242424] sm:text-2xl">{course.title}</h1>
        <div className="mt-2">
          <p className="text-sm text-[#666]">
            Tiến độ: <span className="font-semibold text-[#242424]">{progress}%</span>
          </p>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#f7ddd4] ring-1 ring-[#f05123]/10"
            role="progressbar"
            aria-label="Tiến độ khóa học"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-[#f05123] transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-[minmax(260px,300px)_1fr]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Đóng menu"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            'rounded-2xl border border-[#ececec] bg-white p-4 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto',
            'fixed inset-y-0 left-0 z-50 w-[min(300px,85vw)] overflow-y-auto shadow-xl transition-transform lg:static lg:z-auto lg:w-auto lg:shadow-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <LearnSidebar
            chapters={course.chapters}
            activeLessonId={activeLesson?.id ?? null}
            quizAttemptedLessonIds={quizAttemptedLessonIds}
            onSelectLesson={(lesson) => selectLesson(lesson)}
          />
        </div>

        <div className="min-w-0 rounded-2xl border border-[#ececec] bg-white p-4 sm:p-6">
          {!activeLesson ? (
            <p className="text-[#999]">Chọn bài học để bắt đầu.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#f0f0f0] pb-4">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && selectLesson(prevLesson)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Bài trước
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson)}
                >
                  Bài tiếp <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {viewMode === 'quiz' ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-[#242424] sm:text-xl">
                      {activeLesson.title}
                    </h2>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void backToLesson(activeLesson)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại bài học
                    </Button>
                  </div>
                  {quizQuery.isLoading ? (
                    <p className="text-sm text-[#999]">Đang tải quiz...</p>
                  ) : quizQuery.data ? (
                    <QuizPlayer
                      courseId={course.id}
                      chapterId={activeLesson.chapterId}
                      lessonId={activeLesson.id}
                      quiz={quizQuery.data}
                      onComplete={handleQuizComplete}
                      onDraftChange={setQuizHasDraftAnswers}
                      onNextLesson={nextLesson ? () => selectLesson(nextLesson) : undefined}
                    />
                  ) : (
                    <p className="text-sm text-[#999]">Bài học này chưa có quiz.</p>
                  )}
                </>
              ) : (
                <>
                  {activeLesson.lessonType === 0 ? (
                    (() => {
                      const embed = activeLesson.videoUrl
                        ? parseVideoEmbed(activeLesson.videoUrl)
                        : null
                      const isExternal =
                        embed &&
                        (embed.kind === 'youtube' || embed.kind === 'vimeo' || embed.kind === 'file')
                      if (isExternal && activeLesson.videoUrl) {
                        return (
                          <VideoLessonPlayer
                            url={activeLesson.videoUrl}
                            title={activeLesson.title}
                            onProgressComplete={
                              activeLesson.completed ? undefined : handleLessonComplete
                            }
                          />
                        )
                      }
                      return (
                        <UploadedVideoPlayer
                          courseId={course.id}
                          chapterId={activeLesson.chapterId}
                          lessonId={activeLesson.id}
                          title={activeLesson.title}
                          fallbackUrl={activeLesson.videoUrl}
                          onProgressComplete={
                            activeLesson.completed ? undefined : handleLessonComplete
                          }
                        />
                      )
                    })()
                  ) : activeLesson.lessonType === 1 && activeLesson.documentUrl ? (
                    <div className="rounded-2xl border border-[#ececec] bg-[#fafafa] p-6">
                      <p className="text-sm text-[#6b7280]">Tài liệu bài học</p>
                      <a
                        href={activeLesson.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-[#f05123] hover:underline"
                      >
                        Mở tài liệu →
                      </a>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 border-t border-[#f0f0f0] pt-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-[#242424] sm:text-xl">
                        {activeLesson.title}
                      </h2>
                      {activeLesson.content ? (
                        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#6b7280]">
                          {activeLesson.content}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {activeLesson.hasQuiz ? (
                        <Button size="sm" onClick={() => openQuiz(activeLesson)}>
                          {quizAttemptedLessonIds.has(activeLesson.id) ? 'Làm lại' : 'Làm quiz'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialogHost />
    </div>
  )
}
