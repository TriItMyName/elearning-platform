import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  Bell,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Import,
  Layers,
  Mail,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { categoriesApi } from '@/api/categories.api'
import { teacherApi } from '@/api/teacher.api'
import { LessonMediaInput } from '@/components/admin/LessonMediaInput'
import { ThumbnailUploadField } from '@/components/admin/ThumbnailUploadField'
import {
  AdminBadge,
  AdminCard,
  AdminIconButton,
  AdminListItem,
  AdminModal,
  AdminModalFooter,
  AdminNativeSelect,
  AdminPageHeader,
  AdminPanel,
  AdminTextarea,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useVideoUploadExitGuard } from '@/hooks/useVideoUploadExitGuard'
import { getErrorMessage } from '@/lib/errors'
import { DOCUMENT_ACCEPT, validateDocumentFile, validateVideoFile, VIDEO_ACCEPT } from '@/lib/file-upload'
import {
  DOCUMENT_URL_HINT,
  validateDocumentLessonUrl,
} from '@/lib/media-url'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/category'
import type { Chapter } from '@/types/chapter'
import type { Course } from '@/types/course'
import {
  TEACHER_COURSE_ADMIN_STATUS_OPTIONS,
  TEACHER_COURSE_PUBLISH_OPTIONS,
  teacherAdminStatusLabel,
  toTeacherPublishMode,
  type TeacherCourseAdminStatus,
  type TeacherCoursePublishMode,
} from '@/types/course'
import type { Lesson } from '@/types/lesson'
import { LESSON_TYPE_LABEL, LESSON_TYPE_OPTIONS } from '@/types/lesson'
import type { Question, Quiz } from '@/types/quiz'
import type { TeacherEnrollment, TeacherStudentProgress } from '@/types/teacher'

type CourseDetailTab = 'content' | 'quiz' | 'students'
type CourseModalState = { mode: 'create' | 'edit'; course?: Course } | null
type ChapterModalState = { mode: 'create' | 'edit'; chapter?: Chapter } | null
type LessonModalState = { mode: 'create' | 'edit'; lesson?: Lesson } | null
type QuizModalState = { mode: 'create' | 'edit'; quiz?: Quiz } | null
type QuestionModalState = { mode: 'create' | 'edit'; question?: Question } | null
type NotificationTarget =
  | { kind: 'course'; course: Course }
  | { kind: 'student'; course: Course; student: TeacherEnrollment }

const PAGE_PARAMS = { page: 0, size: 100, sortBy: 'orderIndex', direction: 'asc' as const }
const COURSE_PARAMS = { page: 0, size: 100, sortBy: 'id', direction: 'asc' as const }

const COURSE_DETAIL_TABS: Array<{ id: CourseDetailTab; label: string; icon: typeof Layers }> = [
  { id: 'content', label: 'Nội dung', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: FileQuestion },
  { id: 'students', label: 'Học viên', icon: Users },
]

function createSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa cập nhật'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function courseAdminStatusTone(adminStatus?: string | null) {
  switch (adminStatus) {
    case 'PUBLISHED':
    case 'APPROVED':
      return 'bg-[#ecfdf5] text-[#047857]'
    case 'PENDING':
      return 'bg-[#fff7ed] text-[#c2410c]'
    case 'REJECTED':
      return 'bg-[#fef2f2] text-[#b91c1c]'
    default:
      return 'bg-[#f3f4f6] text-[#4b5563]'
  }
}

function moveItem(ids: number[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= ids.length) return ids
  const next = [...ids]
  const current = next[index]
  next[index] = next[target]
  next[target] = current
  return next
}

function durationLabel(value: number | null | undefined) {
  if (!value) return 'Chưa đặt thời lượng'
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  if (minutes <= 0) return `${seconds}s`
  if (seconds === 0) return `${minutes} phút`
  return `${minutes} phút ${seconds}s`
}

export function TeacherWorkspacePage() {
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [courseView, setCourseView] = useState<'list' | 'detail'>('list')
  const [activeDetailTab, setActiveDetailTab] = useState<CourseDetailTab>('content')
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [courseModal, setCourseModal] = useState<CourseModalState>(null)
  const [chapterModal, setChapterModal] = useState<ChapterModalState>(null)
  const [lessonModal, setLessonModal] = useState<LessonModalState>(null)
  const [quizModal, setQuizModal] = useState<QuizModalState>(null)
  const [questionModal, setQuestionModal] = useState<QuestionModalState>(null)
  const [quizImportOpen, setQuizImportOpen] = useState(false)
  const [notificationTarget, setNotificationTarget] = useState<NotificationTarget | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['teacher', 'courses'],
    queryFn: () => teacherApi.courses.list(COURSE_PARAMS),
  })

  const categoriesQuery = useQuery({
    queryKey: ['teacher', 'categories'],
    queryFn: () => categoriesApi.list({ page: 0, size: 100 }),
  })

  const chaptersQuery = useQuery({
    queryKey: ['teacher', 'chapters', selectedCourseId],
    queryFn: () => teacherApi.chapters.list(selectedCourseId!, PAGE_PARAMS),
    enabled: courseView === 'detail' && selectedCourseId != null,
  })

  const lessonsQuery = useQuery({
    queryKey: ['teacher', 'lessons', selectedCourseId, selectedChapterId],
    queryFn: () => teacherApi.lessons.list(selectedCourseId!, selectedChapterId!, PAGE_PARAMS),
    enabled: courseView === 'detail' && selectedCourseId != null && selectedChapterId != null,
  })

  const quizzesQuery = useQuery({
    queryKey: ['teacher', 'quizzes', selectedCourseId, selectedChapterId, selectedLessonId],
    queryFn: () =>
      teacherApi.quizzes.list(selectedCourseId!, selectedChapterId!, selectedLessonId!),
    enabled:
      courseView === 'detail' &&
      selectedCourseId != null &&
      selectedChapterId != null &&
      selectedLessonId != null,
  })

  const questionsQuery = useQuery({
    queryKey: [
      'teacher',
      'questions',
      selectedCourseId,
      selectedChapterId,
      selectedLessonId,
      selectedQuizId,
    ],
    queryFn: () =>
      teacherApi.quizzes.questions(
        selectedCourseId!,
        selectedChapterId!,
        selectedLessonId!,
        selectedQuizId!,
      ),
    enabled:
      courseView === 'detail' &&
      selectedCourseId != null &&
      selectedChapterId != null &&
      selectedLessonId != null &&
      selectedQuizId != null,
  })

  const studentsQuery = useQuery({
    queryKey: ['teacher', 'students', selectedCourseId],
    queryFn: () => teacherApi.courses.students(selectedCourseId!),
    enabled: courseView === 'detail' && selectedCourseId != null,
  })

  const progressQuery = useQuery({
    queryKey: ['teacher', 'student-progress', selectedCourseId, selectedStudentId],
    queryFn: () => teacherApi.courses.studentProgress(selectedCourseId!, selectedStudentId!),
    enabled: courseView === 'detail' && selectedCourseId != null && selectedStudentId != null,
  })

  const courses = coursesQuery.data?.content ?? []
  const categories = categoriesQuery.data?.content ?? []
  const chapters = chaptersQuery.data?.content ?? []
  const lessons = lessonsQuery.data?.content ?? []
  const quizzes = quizzesQuery.data ?? []
  const questions = questionsQuery.data ?? []
  const students = studentsQuery.data ?? []

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? null
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? null
  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null
  const selectedStudent = students.find((student) => student.studentId === selectedStudentId) ?? null

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>()
    categories.forEach((category) => map.set(category.id, category.name))
    return map
  }, [categories])

  useEffect(() => {
    if (coursesQuery.isLoading) return
    if (courses.length === 0) {
      setSelectedCourseId(null)
      setCourseView('list')
      return
    }
    if (
      selectedCourseId != null &&
      !courses.some((course) => course.id === selectedCourseId)
    ) {
      setSelectedCourseId(null)
      setCourseView('list')
    }
  }, [courses, coursesQuery.isLoading, selectedCourseId])

  useEffect(() => {
    if (!selectedCourseId || chapters.length === 0) {
      setSelectedChapterId(null)
      return
    }
    if (selectedChapterId == null || !chapters.some((chapter) => chapter.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id)
    }
  }, [selectedCourseId, chapters, selectedChapterId])

  useEffect(() => {
    if (!selectedChapterId || lessons.length === 0) {
      setSelectedLessonId(null)
      return
    }
    if (selectedLessonId == null || !lessons.some((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId(lessons[0].id)
    }
  }, [selectedChapterId, lessons, selectedLessonId])

  useEffect(() => {
    if (!selectedLessonId || quizzes.length === 0) {
      setSelectedQuizId(null)
      return
    }
    if (selectedQuizId == null || !quizzes.some((quiz) => quiz.id === selectedQuizId)) {
      setSelectedQuizId(quizzes[0].id)
    }
  }, [selectedLessonId, quizzes, selectedQuizId])

  useEffect(() => {
    if (!selectedCourseId || students.length === 0) {
      setSelectedStudentId(null)
      return
    }
    if (selectedStudentId == null || !students.some((student) => student.studentId === selectedStudentId)) {
      setSelectedStudentId(students[0].studentId)
    }
  }, [selectedCourseId, students, selectedStudentId])

  const selectCourse = (courseId: number) => {
    setSelectedCourseId(courseId)
    setSelectedChapterId(null)
    setSelectedLessonId(null)
    setSelectedQuizId(null)
    setSelectedStudentId(null)
    setCourseView('detail')
    setActiveDetailTab('content')
  }

  const backToCourseList = () => {
    setCourseView('list')
  }

  const invalidateCourses = () => {
    void queryClient.invalidateQueries({ queryKey: ['teacher', 'courses'] })
  }

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: number) => teacherApi.courses.delete(courseId),
    onSuccess: (_data, courseId) => {
      notify.success('Đã xóa khóa học')
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null)
        setCourseView('list')
      }
      invalidateCourses()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: number) => teacherApi.chapters.delete(selectedCourseId!, chapterId),
    onSuccess: () => {
      notify.success('Đã xóa chương')
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'chapters', selectedCourseId] })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const reorderChaptersMutation = useMutation({
    mutationFn: (chapterIds: number[]) =>
      teacherApi.chapters.reorder(selectedCourseId!, { chapterIds }),
    onSuccess: () => {
      notify.success('Đã cập nhật thứ tự chương')
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'chapters', selectedCourseId] })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: number) =>
      teacherApi.lessons.delete(selectedCourseId!, selectedChapterId!, lessonId),
    onSuccess: () => {
      notify.success('Đã xóa bài học')
      void queryClient.invalidateQueries({
        queryKey: ['teacher', 'lessons', selectedCourseId, selectedChapterId],
      })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const reorderLessonsMutation = useMutation({
    mutationFn: (lessonIds: number[]) =>
      teacherApi.lessons.reorder(selectedCourseId!, selectedChapterId!, { lessonIds }),
    onSuccess: () => {
      notify.success('Đã cập nhật thứ tự bài học')
      void queryClient.invalidateQueries({
        queryKey: ['teacher', 'lessons', selectedCourseId, selectedChapterId],
      })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: number) =>
      teacherApi.quizzes.delete(selectedCourseId!, selectedChapterId!, selectedLessonId!, quizId),
    onSuccess: () => {
      notify.success('Đã xóa quiz')
      void queryClient.invalidateQueries({
        queryKey: ['teacher', 'quizzes', selectedCourseId, selectedChapterId, selectedLessonId],
      })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) =>
      teacherApi.quizzes.deleteQuestion(
        selectedCourseId!,
        selectedChapterId!,
        selectedLessonId!,
        selectedQuizId!,
        questionId,
      ),
    onSuccess: () => {
      notify.success('Đã xóa câu hỏi')
      void queryClient.invalidateQueries({
        queryKey: [
          'teacher',
          'questions',
          selectedCourseId,
          selectedChapterId,
          selectedLessonId,
          selectedQuizId,
        ],
      })
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const courseCount = courses.length
  const publishedCount = courses.filter((course) => course.status === 1).length
  const totalStudentCount = students.length

  return (
    <div>
      <AdminPageHeader
        eyebrow="Giảng viên"
        title="Không gian giảng viên"
        description="Quản lý khóa học, chương, bài học, quiz và học viên từ một màn hình gọn gàng."
        action={
          <Button onClick={() => setCourseModal({ mode: 'create' })}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tạo khóa học
          </Button>
        }
      />

      {courseView === 'list' ? (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <TeacherMetricCard label="Khóa đang quản lý" value={courseCount} icon={BookOpen} />
          <TeacherMetricCard label="Đang mở" value={publishedCount} icon={GraduationCap} />
          <TeacherMetricCard label="Học viên khóa chọn" value={totalStudentCount} icon={Users} />
        </div>
      ) : null}

      {courseView === 'detail' && selectedCourse ? (
        <div className="mb-6">
          <button
            type="button"
            onClick={backToCourseList}
            className="mb-3 text-sm font-medium text-[#6b7280] transition hover:text-[#111827]"
          >
            ← Quay lại danh sách khóa học
          </button>

          <AdminCard className="mb-4" padding>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold',
                      courseAdminStatusTone(selectedCourse.adminStatus),
                    )}
                  >
                    {teacherAdminStatusLabel(selectedCourse.adminStatus)}
                  </span>
                  <span className="text-xs text-[#9ca3af]">
                    {categoryMap.get(selectedCourse.categoryId) ??
                      `Danh mục #${selectedCourse.categoryId}`}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-[#111827]">{selectedCourse.title}</h2>
                {selectedCourse.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                    {selectedCourse.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCourseModal({ mode: 'edit', course: selectedCourse })}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Sửa khóa học
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Xóa khóa học',
                      description: `Khóa "${selectedCourse.title}" sẽ bị xóa khỏi khu vực giảng viên của bạn.`,
                      confirmLabel: 'Xóa',
                    })
                    if (ok) deleteCourseMutation.mutate(selectedCourse.id)
                  }}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </div>
          </AdminCard>

          <div className="flex flex-wrap gap-2 rounded-xl border border-[#e8e8e8] bg-white p-1.5">
            {COURSE_DETAIL_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveDetailTab(id)}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition',
                  activeDetailTab === id
                    ? 'bg-[#f05123] text-white shadow-sm'
                    : 'text-[#6b7280] hover:bg-[#f8f8f8] hover:text-[#111827]',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {courseView === 'list' ? (
        <TeacherCoursesTab
          courses={courses}
          categories={categories}
          categoryMap={categoryMap}
          isLoading={coursesQuery.isLoading}
          selectedCourseId={selectedCourseId}
          onSelectCourse={selectCourse}
          onCreate={() => setCourseModal({ mode: 'create' })}
        />
      ) : null}

      {courseView === 'detail' && activeDetailTab === 'content' ? (
        <TeacherContentTab
          selectedCourse={selectedCourse}
          chapters={chapters}
          lessons={lessons}
          selectedChapterId={selectedChapterId}
          selectedChapter={selectedChapter}
          isLoadingChapters={chaptersQuery.isLoading}
          isLoadingLessons={lessonsQuery.isLoading}
          onSelectChapter={(chapterId) => {
            setSelectedChapterId(chapterId)
            setSelectedLessonId(null)
            setSelectedQuizId(null)
          }}
          onCreateChapter={() => setChapterModal({ mode: 'create' })}
          onEditChapter={(chapter) => setChapterModal({ mode: 'edit', chapter })}
          onDeleteChapter={async (chapter) => {
            const ok = await confirm({
              title: 'Xóa chương',
              description: `Xóa "${chapter.title}" và các bài học bên trong?`,
              confirmLabel: 'Xóa',
            })
            if (ok) deleteChapterMutation.mutate(chapter.id)
          }}
          onMoveChapter={(index, direction) =>
            reorderChaptersMutation.mutate(moveItem(chapters.map((chapter) => chapter.id), index, direction))
          }
          onCreateLesson={() => setLessonModal({ mode: 'create' })}
          onEditLesson={(lesson) => setLessonModal({ mode: 'edit', lesson })}
          onDeleteLesson={async (lesson) => {
            const ok = await confirm({
              title: 'Xóa bài học',
              description: `Xóa bài "${lesson.title}" khỏi chương đang chọn?`,
              confirmLabel: 'Xóa',
            })
            if (ok) deleteLessonMutation.mutate(lesson.id)
          }}
          onMoveLesson={(index, direction) =>
            reorderLessonsMutation.mutate(moveItem(lessons.map((lesson) => lesson.id), index, direction))
          }
        />
      ) : null}

      {courseView === 'detail' && activeDetailTab === 'quiz' ? (
        <TeacherQuizTab
          selectedCourse={selectedCourse}
          chapters={chapters}
          lessons={lessons}
          quizzes={quizzes}
          questions={questions}
          selectedChapterId={selectedChapterId}
          selectedLessonId={selectedLessonId}
          selectedQuizId={selectedQuizId}
          selectedLesson={selectedLesson}
          selectedQuiz={selectedQuiz}
          isLoadingLessons={lessonsQuery.isLoading}
          isLoadingQuizzes={quizzesQuery.isLoading}
          isLoadingQuestions={questionsQuery.isLoading}
          onSelectChapter={(chapterId) => {
            setSelectedChapterId(chapterId)
            setSelectedLessonId(null)
            setSelectedQuizId(null)
          }}
          onSelectLesson={(lessonId) => {
            setSelectedLessonId(lessonId)
            setSelectedQuizId(null)
          }}
          onSelectQuiz={setSelectedQuizId}
          onCreateQuiz={() => setQuizModal({ mode: 'create' })}
          onEditQuiz={(quiz) => setQuizModal({ mode: 'edit', quiz })}
          onDeleteQuiz={async (quiz) => {
            const ok = await confirm({
              title: 'Xóa quiz',
              description: 'Toàn bộ câu hỏi trong quiz này cũng sẽ bị xóa.',
              confirmLabel: 'Xóa',
            })
            if (ok) deleteQuizMutation.mutate(quiz.id)
          }}
          onImportQuiz={() => setQuizImportOpen(true)}
          onCreateQuestion={() => setQuestionModal({ mode: 'create' })}
          onEditQuestion={(question) => setQuestionModal({ mode: 'edit', question })}
          onDeleteQuestion={async (question) => {
            const ok = await confirm({
              title: 'Xóa câu hỏi',
              description: 'Bạn có chắc muốn xóa câu hỏi này?',
              confirmLabel: 'Xóa',
            })
            if (ok) deleteQuestionMutation.mutate(question.id)
          }}
        />
      ) : null}

      {courseView === 'detail' && activeDetailTab === 'students' ? (
        <TeacherStudentsTab
          selectedCourse={selectedCourse}
          students={students}
          selectedStudentId={selectedStudentId}
          selectedStudent={selectedStudent}
          progress={progressQuery.data}
          isLoadingStudents={studentsQuery.isLoading}
          isLoadingProgress={progressQuery.isLoading}
          onSelectStudent={setSelectedStudentId}
          onNotifyCourse={(course) => setNotificationTarget({ kind: 'course', course })}
          onNotifyStudent={(course, student) =>
            setNotificationTarget({ kind: 'student', course, student })
          }
        />
      ) : null}

      {courseModal ? (
        <CourseFormModal
          state={courseModal}
          categories={categories}
          onClose={() => setCourseModal(null)}
          onSuccess={invalidateCourses}
        />
      ) : null}

      {selectedCourseId && chapterModal ? (
        <ChapterFormModal
          state={chapterModal}
          courseId={selectedCourseId}
          nextOrder={chapters.length + 1}
          onClose={() => setChapterModal(null)}
        />
      ) : null}

      {selectedCourseId && selectedChapterId && lessonModal ? (
        <LessonFormModal
          state={lessonModal}
          courseId={selectedCourseId}
          chapterId={selectedChapterId}
          nextOrder={lessons.length + 1}
          onClose={() => setLessonModal(null)}
        />
      ) : null}

      {selectedCourseId && selectedChapterId && selectedLessonId && quizModal ? (
        <QuizFormModal
          state={quizModal}
          courseId={selectedCourseId}
          chapterId={selectedChapterId}
          lessonId={selectedLessonId}
          onClose={() => setQuizModal(null)}
          onCreated={setSelectedQuizId}
        />
      ) : null}

      {selectedCourseId && selectedChapterId && selectedLessonId && quizImportOpen ? (
        <QuizImportModal
          courseId={selectedCourseId}
          chapterId={selectedChapterId}
          lessonId={selectedLessonId}
          onClose={() => setQuizImportOpen(false)}
          onCreated={setSelectedQuizId}
        />
      ) : null}

      {selectedCourseId && selectedChapterId && selectedLessonId && selectedQuizId && questionModal ? (
        <QuestionFormModal
          state={questionModal}
          courseId={selectedCourseId}
          chapterId={selectedChapterId}
          lessonId={selectedLessonId}
          quizId={selectedQuizId}
          nextOrder={questions.length + 1}
          onClose={() => setQuestionModal(null)}
        />
      ) : null}

      {notificationTarget ? (
        <NotificationModal
          target={notificationTarget}
          onClose={() => setNotificationTarget(null)}
          onSuccess={() => {
            void queryClient.invalidateQueries({
              queryKey: ['teacher', 'students', selectedCourseId],
            })
          }}
        />
      ) : null}

      <ConfirmDialogHost />
    </div>
  )
}

function TeacherMetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof BookOpen
}) {
  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6b7280]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff4f0] text-[#f05123]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

function TeacherCoursesTab({
  courses,
  categories,
  categoryMap,
  isLoading,
  selectedCourseId,
  onSelectCourse,
  onCreate,
}: {
  courses: Course[]
  categories: Category[]
  categoryMap: Map<number, string>
  isLoading: boolean
  selectedCourseId: number | null
  onSelectCourse: (courseId: number) => void
  onCreate: () => void
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<TeacherCourseAdminStatus | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return courses.filter((course) => {
      if (status !== '' && course.adminStatus !== status) return false
      if (categoryId !== '' && course.categoryId !== categoryId) return false
      if (!query) return true
      return (
        course.title.toLowerCase().includes(query) ||
        course.slug.toLowerCase().includes(query) ||
        (course.description ?? '').toLowerCase().includes(query)
      )
    })
  }, [courses, keyword, status, categoryId])

  return (
    <AdminCard padding>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Khóa học của tôi</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Tạo, sửa trạng thái và chọn khóa để quản lý nội dung.
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Tạo khóa học
        </Button>
      </div>

      <div className="mb-5 grid gap-2 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm khóa học..."
            className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#f05123] focus:ring-2 focus:ring-[#f05123]/15"
          />
        </div>
        <AdminNativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value as TeacherCourseAdminStatus | '')}
        >
          <option value="">Mọi trạng thái</option>
          {TEACHER_COURSE_ADMIN_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminNativeSelect>
        <AdminNativeSelect
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : '')}
        >
          <option value="">Mọi danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </AdminNativeSelect>
      </div>

      {isLoading ? (
        <TeacherEmptyState icon={BookOpen} title="Đang tải khóa học" />
      ) : filtered.length === 0 ? (
        <TeacherEmptyState
          icon={BookOpen}
          title={courses.length === 0 ? 'Chưa có khóa học' : 'Không tìm thấy khóa phù hợp'}
          description={courses.length === 0 ? 'Tạo khóa học đầu tiên để bắt đầu xây dựng nội dung.' : undefined}
          action={courses.length === 0 ? <Button onClick={onCreate}>Tạo khóa học</Button> : undefined}
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {filtered.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className={cn(
                'rounded-xl border bg-white p-4 text-left transition hover:border-[#f05123]/35 hover:bg-[#fff8f5]',
                selectedCourseId === course.id
                  ? 'border-[#f05123]/45 bg-[#fff8f5]'
                  : 'border-[#ececec]',
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold',
                    courseAdminStatusTone(course.adminStatus),
                  )}
                >
                  {teacherAdminStatusLabel(course.adminStatus)}
                </span>
                <span className="text-xs text-[#9ca3af]">
                  {categoryMap.get(course.categoryId) ?? `Danh mục #${course.categoryId}`}
                </span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-base font-bold text-[#111827]">
                {course.title}
              </h3>
              <p className="mt-1 truncate font-mono text-xs text-[#9ca3af]">{course.slug}</p>
              {course.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6b7280]">
                  {course.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-[#9ca3af]">
                Cập nhật {formatDate(course.upDateTime ?? course.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </AdminCard>
  )
}

function TeacherContentTab({
  selectedCourse,
  chapters,
  lessons,
  selectedChapterId,
  selectedChapter,
  isLoadingChapters,
  isLoadingLessons,
  onSelectChapter,
  onCreateChapter,
  onEditChapter,
  onDeleteChapter,
  onMoveChapter,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: {
  selectedCourse: Course | null
  chapters: Chapter[]
  lessons: Lesson[]
  selectedChapterId: number | null
  selectedChapter: Chapter | null
  isLoadingChapters: boolean
  isLoadingLessons: boolean
  onSelectChapter: (chapterId: number) => void
  onCreateChapter: () => void
  onEditChapter: (chapter: Chapter) => void
  onDeleteChapter: (chapter: Chapter) => void
  onMoveChapter: (index: number, direction: -1 | 1) => void
  onCreateLesson: () => void
  onEditLesson: (lesson: Lesson) => void
  onDeleteLesson: (lesson: Lesson) => void
  onMoveLesson: (index: number, direction: -1 | 1) => void
}) {
  if (!selectedCourse) {
    return (
      <TeacherEmptyState
        icon={BookOpen}
        title="Chọn hoặc tạo khóa học"
        description="Bạn cần có một khóa học trước khi thêm chương và bài học."
      />
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(280px,340px)_1fr]">
      <AdminPanel
        title="Chương học"
        action={
          <Button size="sm" onClick={onCreateChapter}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Thêm
          </Button>
        }
      >
        {isLoadingChapters ? (
          <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải chương...</p>
        ) : chapters.length === 0 ? (
          <TeacherPanelEmpty
            title="Khóa này chưa có chương"
            action={<Button size="sm" onClick={onCreateChapter}>Tạo chương đầu tiên</Button>}
          />
        ) : (
          chapters.map((chapter, index) => (
            <AdminListItem
              key={chapter.id}
              active={selectedChapterId === chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              actions={
                <>
                  <AdminIconButton
                    title="Đưa lên"
                    disabled={index === 0}
                    onClick={() => onMoveChapter(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </AdminIconButton>
                  <AdminIconButton
                    title="Đưa xuống"
                    disabled={index === chapters.length - 1}
                    onClick={() => onMoveChapter(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </AdminIconButton>
                  <AdminIconButton title="Sửa chương" onClick={() => onEditChapter(chapter)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </AdminIconButton>
                  <AdminIconButton
                    title="Xóa chương"
                    variant="danger"
                    onClick={() => onDeleteChapter(chapter)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AdminIconButton>
                </>
              }
            >
              <span className="flex flex-col gap-0.5">
                <span>{chapter.title}</span>
                <span className="text-xs text-[#9ca3af]">Thứ tự {chapter.orderIndex}</span>
              </span>
            </AdminListItem>
          ))
        )}
      </AdminPanel>

      <AdminPanel
        title={`Bài học (${lessons.length})`}
        action={
          <Button size="sm" disabled={!selectedChapter} onClick={onCreateLesson}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Thêm bài học
          </Button>
        }
      >
          {!selectedChapter ? (
            <TeacherPanelEmpty title="Chọn một chương để xem bài học" />
          ) : isLoadingLessons ? (
            <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải bài học...</p>
          ) : lessons.length === 0 ? (
            <TeacherPanelEmpty
              title="Chương này chưa có bài học"
              action={<Button size="sm" onClick={onCreateLesson}>Thêm bài học đầu tiên</Button>}
            />
          ) : (
            <div className="divide-y divide-[#f3f4f6]">
              {lessons.map((lesson, index) => (
                <TeacherLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  total={lessons.length}
                  onEdit={() => onEditLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson)}
                  onMove={(direction) => onMoveLesson(index, direction)}
                />
              ))}
            </div>
          )}
        </AdminPanel>
    </div>
  )
}

function TeacherLessonRow({
  lesson,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
}: {
  lesson: Lesson
  index: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-[#9ca3af]">Bài {index + 1}</p>
            <AdminBadge>{LESSON_TYPE_LABEL[lesson.lessonType] ?? 'Bài học'}</AdminBadge>
            <AdminBadge>{durationLabel(lesson.duration)}</AdminBadge>
          </div>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#111827]">{lesson.title}</p>
          {lesson.content ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6b7280]">{lesson.content}</p>
          ) : null}
          {lesson.videoUrl ? (
            <p className="mt-1 truncate text-xs text-[#9ca3af]">Video: {lesson.videoUrl}</p>
          ) : null}
          {lesson.documentUrl ? (
            <p className="mt-1 truncate text-xs text-[#9ca3af]">Tài liệu: {lesson.documentUrl}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-0.5">
          <AdminIconButton title="Đưa lên" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </AdminIconButton>
          <AdminIconButton title="Đưa xuống" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </AdminIconButton>
          <AdminIconButton title="Sửa bài học" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </AdminIconButton>
          <AdminIconButton title="Xóa bài học" variant="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </AdminIconButton>
        </div>
      </div>
    </div>
  )
}

function TeacherQuizTab({
  selectedCourse,
  chapters,
  lessons,
  quizzes,
  questions,
  selectedChapterId,
  selectedLessonId,
  selectedQuizId,
  selectedLesson,
  selectedQuiz,
  isLoadingLessons,
  isLoadingQuizzes,
  isLoadingQuestions,
  onSelectChapter,
  onSelectLesson,
  onSelectQuiz,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onImportQuiz,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: {
  selectedCourse: Course | null
  chapters: Chapter[]
  lessons: Lesson[]
  quizzes: Quiz[]
  questions: Question[]
  selectedChapterId: number | null
  selectedLessonId: number | null
  selectedQuizId: number | null
  selectedLesson: Lesson | null
  selectedQuiz: Quiz | null
  isLoadingLessons: boolean
  isLoadingQuizzes: boolean
  isLoadingQuestions: boolean
  onSelectChapter: (chapterId: number) => void
  onSelectLesson: (lessonId: number) => void
  onSelectQuiz: (quizId: number) => void
  onCreateQuiz: () => void
  onEditQuiz: (quiz: Quiz) => void
  onDeleteQuiz: (quiz: Quiz) => void
  onImportQuiz: () => void
  onCreateQuestion: () => void
  onEditQuestion: (question: Question) => void
  onDeleteQuestion: (question: Question) => void
}) {
  if (!selectedCourse) {
    return <TeacherEmptyState icon={FileQuestion} title="Chọn khóa học để soạn quiz" />
  }

  return (
    <div className="space-y-4">
      <AdminCard padding>
        <div className="grid gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Chương</label>
            <AdminNativeSelect
              value={selectedChapterId ?? ''}
              onChange={(event) => onSelectChapter(Number(event.target.value))}
              disabled={chapters.length === 0}
            >
              {chapters.length === 0 ? <option value="">Chưa có chương</option> : null}
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </AdminNativeSelect>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Bài học</label>
            <AdminNativeSelect
              value={selectedLessonId ?? ''}
              onChange={(event) => onSelectLesson(Number(event.target.value))}
              disabled={lessons.length === 0 || isLoadingLessons}
            >
              {lessons.length === 0 ? <option value="">Chưa có bài học</option> : null}
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </AdminNativeSelect>
          </div>
          <div className="flex items-end gap-2">
            <Button className="flex-1" disabled={!selectedLesson} onClick={onCreateQuiz}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo quiz
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={!selectedLesson}
              onClick={onImportQuiz}
            >
              <Import className="mr-1.5 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,340px)_1fr]">
        <AdminPanel title="Danh sách quiz">
          {!selectedLesson ? (
            <TeacherPanelEmpty title="Chọn bài học để xem quiz" />
          ) : isLoadingQuizzes ? (
            <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải quiz...</p>
          ) : quizzes.length === 0 ? (
            <TeacherPanelEmpty
              title="Bài học này chưa có quiz"
              action={<Button size="sm" onClick={onCreateQuiz}>Tạo quiz đầu tiên</Button>}
            />
          ) : (
            quizzes.map((quiz) => (
              <AdminListItem
                key={quiz.id}
                active={selectedQuizId === quiz.id}
                onClick={() => onSelectQuiz(quiz.id)}
                actions={
                  <>
                    <AdminIconButton title="Sửa quiz" onClick={() => onEditQuiz(quiz)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </AdminIconButton>
                    <AdminIconButton
                      title="Xóa quiz"
                      variant="danger"
                      onClick={() => onDeleteQuiz(quiz)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AdminIconButton>
                  </>
                }
              >
                <span className="flex flex-col gap-1">
                  <span>Quiz #{quiz.id}</span>
                  <span className="flex gap-1.5">
                    <AdminBadge tone="accent">{quiz.timeLimit ?? 'Không giới hạn'} phút</AdminBadge>
                    <AdminBadge>{quiz.passScore ?? 0} điểm</AdminBadge>
                  </span>
                </span>
              </AdminListItem>
            ))
          )}
        </AdminPanel>

        <AdminPanel
          title={`Câu hỏi (${questions.length})`}
          action={
            <Button size="sm" disabled={!selectedQuiz} onClick={onCreateQuestion}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Thêm câu hỏi
            </Button>
          }
        >
          {!selectedQuiz ? (
            <TeacherPanelEmpty title="Chọn quiz để xem câu hỏi" />
          ) : isLoadingQuestions ? (
            <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải câu hỏi...</p>
          ) : questions.length === 0 ? (
            <TeacherPanelEmpty title="Quiz này chưa có câu hỏi" />
          ) : (
              <div className="divide-y divide-[#f3f4f6]">
                {questions.map((question, index) => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    index={index}
                    onEdit={() => onEditQuestion(question)}
                    onDelete={() => onDeleteQuestion(question)}
                  />
                ))}
              </div>
            )}
        </AdminPanel>
      </div>
    </div>
  )
}

function QuestionRow({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: Question
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#9ca3af]">
            Câu {index + 1} | {question.score} điểm
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-[#111827]">
            {question.content}
          </p>
          <div className="mt-3 grid gap-1.5 md:grid-cols-2">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm',
                  option.isCorrect
                    ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
                    : 'border-[#ececec] bg-[#fcfcfc] text-[#374151]',
                )}
              >
                {option.content}
                {option.isCorrect ? (
                  <span className="ml-2 text-[10px] font-bold tracking-wide text-[#059669] uppercase">
                    Đúng
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <AdminIconButton title="Sửa câu hỏi" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </AdminIconButton>
          <AdminIconButton title="Xóa câu hỏi" variant="danger" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </AdminIconButton>
        </div>
      </div>
    </div>
  )
}

function TeacherStudentsTab({
  selectedCourse,
  students,
  selectedStudentId,
  selectedStudent,
  progress,
  isLoadingStudents,
  isLoadingProgress,
  onSelectStudent,
  onNotifyCourse,
  onNotifyStudent,
}: {
  selectedCourse: Course | null
  students: TeacherEnrollment[]
  selectedStudentId: number | null
  selectedStudent: TeacherEnrollment | null
  progress?: TeacherStudentProgress
  isLoadingStudents: boolean
  isLoadingProgress: boolean
  onSelectStudent: (studentId: number) => void
  onNotifyCourse: (course: Course) => void
  onNotifyStudent: (course: Course, student: TeacherEnrollment) => void
}) {
  if (!selectedCourse) {
    return <TeacherEmptyState icon={Users} title="Chọn khóa học để xem học viên" />
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(300px,360px)_1fr]">
      <AdminPanel
        title={`Học viên (${students.length})`}
        action={
          <Button size="sm" disabled={students.length === 0} onClick={() => onNotifyCourse(selectedCourse)}>
            <Bell className="mr-1 h-3.5 w-3.5" />
            Báo cả lớp
          </Button>
        }
      >
        {isLoadingStudents ? (
          <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải học viên...</p>
        ) : students.length === 0 ? (
          <TeacherPanelEmpty title="Chưa có học viên đăng ký khóa này" />
        ) : (
          students.map((student) => (
            <AdminListItem
              key={student.studentId}
              active={selectedStudentId === student.studentId}
              onClick={() => onSelectStudent(student.studentId)}
              actions={
                <AdminIconButton
                  title="Gửi thông báo riêng"
                  onClick={() => onNotifyStudent(selectedCourse, student)}
                >
                  <Mail className="h-3.5 w-3.5" />
                </AdminIconButton>
              }
            >
              <span className="flex flex-col gap-0.5">
                <span>{student.fullName || student.username}</span>
                <span className="text-xs text-[#9ca3af]">
                  {student.email} | Tiến độ {student.progress ?? 0}%
                </span>
              </span>
            </AdminListItem>
          ))
        )}
      </AdminPanel>

      <AdminCard padding>
        {!selectedStudent ? (
          <TeacherEmptyState icon={Users} title="Chọn học viên để xem tiến độ" compact />
        ) : isLoadingProgress ? (
          <TeacherEmptyState icon={Users} title="Đang tải tiến độ" compact />
        ) : progress ? (
          <div>
            <div className="flex flex-col gap-3 border-b border-[#ececec] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b7280]">Tiến độ học viên</p>
                <h2 className="mt-1 text-xl font-bold text-[#111827]">{progress.studentName}</h2>
                <p className="mt-1 text-sm text-[#6b7280]">{progress.studentEmail ?? selectedStudent.email}</p>
              </div>
              <Button size="sm" onClick={() => onNotifyStudent(selectedCourse, selectedStudent)}>
                <Send className="mr-1 h-3.5 w-3.5" />
                Nhắc học viên
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <ProgressMiniStat label="Hoàn thành" value={`${progress.progress ?? 0}%`} />
              <ProgressMiniStat label="Bài đã học" value={progress.completedLessons} />
              <ProgressMiniStat label="Tổng bài" value={progress.totalLessons} />
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#ececec]">
              {progress.lessons.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[#9ca3af]">Chưa có bài học để theo dõi.</p>
              ) : (
                progress.lessons.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="flex items-center justify-between gap-3 border-b border-[#f3f4f6] px-4 py-3 last:border-b-0"
                  >
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#374151]">
                      {lesson.lessonTitle}
                    </p>
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[11px] font-semibold',
                        lesson.completed
                          ? 'bg-[#ecfdf5] text-[#047857]'
                          : 'bg-[#f3f4f6] text-[#6b7280]',
                      )}
                    >
                      {lesson.completed ? 'Đã học' : 'Chưa học'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <TeacherEmptyState icon={Users} title="Chưa có dữ liệu tiến độ" compact />
        )}
      </AdminCard>
    </div>
  )
}

function ProgressMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#ececec] bg-[#fcfcfc] p-4">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#111827]">{value}</p>
    </div>
  )
}

function TeacherEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: typeof BookOpen
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0e0e0] bg-white px-6 text-center',
        compact ? 'py-12' : 'py-16',
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff4f0] text-[#f05123]">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-bold text-[#111827]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6b7280]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

function TeacherPanelEmpty({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-[#6b7280]">{title}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

function CourseFormModal({
  state,
  categories,
  onClose,
  onSuccess,
}: {
  state: Exclude<CourseModalState, null>
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()
  const initial = state.course
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    categoryId: initial?.categoryId ?? 0,
    description: initial?.description ?? '',
    thumbnail: initial?.thumbnail ?? '',
    publishMode: toTeacherPublishMode(initial?.adminStatus) as TeacherCoursePublishMode,
  })

  useEffect(() => {
    setForm({
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      categoryId: initial?.categoryId ?? 0,
      description: initial?.description ?? '',
      thumbnail: initial?.thumbnail ?? '',
      publishMode: toTeacherPublishMode(initial?.adminStatus),
    })
  }, [initial])

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || createSlug(form.title),
        categoryId: form.categoryId,
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        submitForReview: form.publishMode === 'submit',
      }
      return state.mode === 'edit' && initial
        ? teacherApi.courses.update(initial.id, payload)
        : teacherApi.courses.create(payload)
    },
    onSuccess: () => {
      const isSubmit = form.publishMode === 'submit'
      notify.success(
        state.mode === 'edit'
          ? isSubmit
            ? 'Đã cập nhật và gửi khóa học chờ admin duyệt'
            : 'Đã lưu khóa học ở trạng thái nháp'
          : isSubmit
            ? 'Đã tạo khóa học và gửi chờ admin duyệt'
            : 'Đã tạo khóa học ở trạng thái nháp',
      )
      onSuccess()
      void queryClient.invalidateQueries({ queryKey: ['courses', 'my'] })
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const canSubmit = Boolean(
    form.title.trim().length > 0 && (form.slug.trim() || createSlug(form.title)) && form.categoryId > 0,
  )

  return (
    <AdminModal
      open
      title={state.mode === 'edit' ? 'Sửa khóa học' : 'Tạo khóa học'}
      description="Chọn lưu nháp hoặc gửi duyệt. Khóa học chỉ công khai sau khi admin duyệt."
      onClose={onClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!canSubmit}
          submitLabel={state.mode === 'edit' ? 'Lưu' : 'Tạo khóa học'}
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(event) => {
            const title = event.target.value
            setForm((current) => ({
              ...current,
              title,
              slug: current.slug === createSlug(current.title) || !current.slug ? createSlug(title) : current.slug,
            }))
          }}
          placeholder="VD: React căn bản cho người mới"
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: createSlug(event.target.value) })}
          placeholder="react-can-ban"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Danh mục</label>
          <AdminNativeSelect
            value={form.categoryId || ''}
            onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Mô tả</label>
          <AdminTextarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={4}
            placeholder="Mô tả ngắn giúp học viên hiểu khóa học này dành cho ai."
          />
        </div>
        <ThumbnailUploadField
          thumbnail={form.thumbnail}
          onThumbnailChange={(thumbnail) => setForm({ ...form, thumbnail })}
          disabled={mutation.isPending}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">Trạng thái lưu</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {TEACHER_COURSE_PUBLISH_OPTIONS.map((option) => {
              const active = form.publishMode === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, publishMode: option.value })}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left transition',
                    active
                      ? 'border-[#f05123] bg-[#fff8f5] ring-2 ring-[#f05123]/15'
                      : 'border-[#e5e7eb] bg-white hover:border-[#f05123]/35',
                  )}
                >
                  <p className="text-sm font-semibold text-[#111827]">{option.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{option.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </AdminModal>
  )
}

function ChapterFormModal({
  state,
  courseId,
  nextOrder,
  onClose,
}: {
  state: Exclude<ChapterModalState, null>
  courseId: number
  nextOrder: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const initial = state.chapter
  const [title, setTitle] = useState(initial?.title ?? '')
  const [orderIndex, setOrderIndex] = useState(initial?.orderIndex ?? nextOrder)

  const mutation = useMutation({
    mutationFn: () =>
      initial
        ? teacherApi.chapters.update(courseId, initial.id, { title: title.trim(), orderIndex })
        : teacherApi.chapters.create(courseId, { title: title.trim(), orderIndex }),
    onSuccess: () => {
      notify.success(initial ? 'Đã cập nhật chương' : 'Đã tạo chương')
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'chapters', courseId] })
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  return (
    <AdminModal
      open
      title={initial ? 'Sửa chương' : 'Tạo chương'}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!title.trim()}
          submitLabel={initial ? 'Lưu' : 'Tạo chương'}
        />
      }
    >
      <div className="space-y-4">
        <Input label="Tiêu đề chương" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input
          label="Thứ tự"
          type="number"
          min={1}
          value={String(orderIndex)}
          onChange={(event) => setOrderIndex(Number(event.target.value))}
        />
      </div>
    </AdminModal>
  )
}

function LessonFormModal({
  state,
  courseId,
  chapterId,
  nextOrder,
  onClose,
}: {
  state: Exclude<LessonModalState, null>
  courseId: number
  chapterId: number
  nextOrder: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { confirm, ConfirmDialogHost: LessonConfirmDialogHost } = useConfirmDialog()
  const guardVideoUploadExit = useVideoUploadExitGuard(confirm)
  const initial = state.lesson
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    lessonType: initial?.lessonType ?? 0,
    videoUrl: initial?.videoUrl ?? '',
    documentUrl: initial?.documentUrl ?? '',
    duration: String(initial?.duration ?? ''),
    content: initial?.content ?? '',
    orderIndex: initial?.orderIndex ?? nextOrder,
  })
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  useEffect(() => {
    if (!initial) return
    setForm({
      title: initial.title,
      lessonType: initial.lessonType,
      videoUrl: initial.videoUrl ?? '',
      documentUrl: initial.documentUrl ?? '',
      duration: String(initial.duration ?? ''),
      content: initial.content ?? '',
      orderIndex: initial.orderIndex,
    })
    setPendingFile(null)
  }, [initial])

  const invalidateLessons = () => {
    void queryClient.invalidateQueries({ queryKey: ['teacher', 'lessons', courseId, chapterId] })
  }

  const uploadVideoMutation = useMutation({
    mutationFn: (file: File) =>
      teacherApi.lessons.uploadVideo(courseId, chapterId, initial!.id, file),
    onSuccess: (lesson) => {
      notify.success('Tải video lên thành công')
      setForm((current) => ({ ...current, videoUrl: lesson.videoUrl ?? '' }))
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: (file: File) =>
      teacherApi.lessons.uploadDocument(courseId, chapterId, initial!.id, file),
    onSuccess: (lesson) => {
      notify.success('Tải tài liệu lên thành công')
      setForm((current) => ({ ...current, documentUrl: lesson.documentUrl ?? '' }))
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const handleFileSelect = (file: File) => {
    if (form.lessonType === 0) {
      const error = validateVideoFile(file)
      if (error) {
        notify.error(error)
        return
      }
      if (initial) {
        uploadVideoMutation.mutate(file)
        return
      }
      setPendingFile(file)
      return
    }

    if (form.lessonType === 1) {
      const error = validateDocumentFile(file)
      if (error) {
        notify.error(error)
        return
      }
      if (initial) {
        uploadDocumentMutation.mutate(file)
        return
      }
      setPendingFile(file)
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        lessonType: form.lessonType,
        videoUrl: form.lessonType === 0 && initial ? form.videoUrl.trim() || undefined : undefined,
        documentUrl: form.lessonType === 1 ? form.documentUrl.trim() || undefined : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        content: form.content.trim() || undefined,
        orderIndex: form.orderIndex,
      }

      if (initial) {
        return teacherApi.lessons.update(courseId, chapterId, initial.id, payload)
      }

      const created = await teacherApi.lessons.create(courseId, chapterId, payload)
      if (!pendingFile) return created

      if (form.lessonType === 0) {
        return teacherApi.lessons.uploadVideo(courseId, chapterId, created.id, pendingFile)
      }
      if (form.lessonType === 1) {
        return teacherApi.lessons.uploadDocument(courseId, chapterId, created.id, pendingFile)
      }
      return created
    },
    onSuccess: () => {
      notify.success(initial ? 'Đã cập nhật bài học' : 'Đã tạo bài học')
      invalidateLessons()
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const saveMetadataMutation = useMutation({
    mutationFn: () => {
      if (!initial) return Promise.resolve(null)
      return teacherApi.lessons.update(courseId, chapterId, initial.id, {
        title: form.title.trim(),
        lessonType: form.lessonType,
        videoUrl: form.lessonType === 0 ? initial.videoUrl?.trim() || undefined : undefined,
        documentUrl: form.lessonType === 1 ? form.documentUrl.trim() || undefined : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        content: form.content.trim() || undefined,
        orderIndex: form.orderIndex,
      })
    },
    onSuccess: () => {
      notify.success('Đã lưu thông tin bài học')
      invalidateLessons()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const hasMetadataChanges = useMemo(() => {
    if (!initial) return false
    return (
      form.title !== initial.title ||
      form.lessonType !== initial.lessonType ||
      form.content !== (initial.content ?? '') ||
      form.orderIndex !== initial.orderIndex ||
      form.duration !== String(initial.duration ?? '') ||
      (form.lessonType === 1 && form.documentUrl !== (initial.documentUrl ?? ''))
    )
  }, [form, initial])

  const exitWhileVideoUploading = useCallback(async () => {
    if (initial && hasMetadataChanges) {
      await saveMetadataMutation.mutateAsync()
    }
    onClose()
  }, [initial, hasMetadataChanges, saveMetadataMutation, onClose])

  const isUploading = uploadVideoMutation.isPending || uploadDocumentMutation.isPending
  const isVideoUploading =
    form.lessonType === 0 &&
    (uploadVideoMutation.isPending || (mutation.isPending && !!pendingFile))
  const documentUrlError = useMemo(
    () => (form.lessonType === 1 ? validateDocumentLessonUrl(form.documentUrl) : null),
    [form.lessonType, form.documentUrl],
  )
  const hasUrlError = Boolean(documentUrlError)

  const handleSubmit = () => {
    if (hasUrlError) {
      notify.error(documentUrlError ?? 'Link không hợp lệ')
      return
    }
    if (isVideoUploading) {
      void guardVideoUploadExit(true, exitWhileVideoUploading)
      return
    }
    mutation.mutate()
  }

  const requestClose = () => {
    void guardVideoUploadExit(isVideoUploading, () => {
      if (isVideoUploading) {
        void exitWhileVideoUploading()
      } else {
        onClose()
      }
    })
  }

  return (
    <>
    <AdminModal
      open
      title={initial ? 'Sửa bài học' : 'Tạo bài học'}
      description="Nhập link hoặc tải file trực tiếp theo loại bài học."
      onClose={requestClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={requestClose}
          onSubmit={handleSubmit}
          isLoading={mutation.isPending}
          submitDisabled={!form.title.trim() || hasUrlError}
          submitLabel={initial ? 'Lưu' : 'Tạo bài học'}
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Loại bài học</label>
            <AdminNativeSelect
              value={form.lessonType}
              onChange={(event) => {
                const lessonType = Number(event.target.value)
                setForm({
                  ...form,
                  lessonType,
                  videoUrl: lessonType === 0 ? form.videoUrl : '',
                  documentUrl: lessonType === 1 ? form.documentUrl : '',
                })
                setPendingFile(null)
              }}
            >
              {LESSON_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminNativeSelect>
          </div>
          <Input
            label="Thứ tự"
            type="number"
            min={1}
            value={String(form.orderIndex)}
            onChange={(event) => setForm({ ...form, orderIndex: Number(event.target.value) })}
          />
        </div>
        {form.lessonType === 0 ? (
          <LessonMediaInput
            label="Video"
            url={form.videoUrl}
            onUrlChange={() => {}}
            accept={VIDEO_ACCEPT}
            uploadTitle="Tải video (.mp4, .webm, .mov)"
            uploadOnly
            isUploading={isUploading}
            pendingFileName={!initial ? pendingFile?.name : null}
            disabledHint={!initial ? 'Chọn file — sẽ tải lên sau khi tạo bài học' : undefined}
            onFileSelect={handleFileSelect}
          />
        ) : null}
        {form.lessonType === 1 ? (
          <LessonMediaInput
            label="Tài liệu URL"
            url={form.documentUrl}
            onUrlChange={(documentUrl) => setForm({ ...form, documentUrl })}
            accept={DOCUMENT_ACCEPT}
            uploadTitle="Tải tài liệu (.pdf, .doc, .docx, .ppt, .pptx)"
            uploadIcon="document"
            isUploading={isUploading}
            pendingFileName={!initial ? pendingFile?.name : null}
            disabledHint={!initial ? 'Hoặc chọn file — sẽ tải lên sau khi tạo bài học' : undefined}
            urlError={documentUrlError}
            hint={DOCUMENT_URL_HINT}
            onFileSelect={handleFileSelect}
          />
        ) : null}
        {form.lessonType === 0 ? (
          <Input
            label="Thời lượng (giây)"
            type="number"
            min={0}
            value={form.duration}
            onChange={(event) => setForm({ ...form, duration: event.target.value })}
          />
        ) : null}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Nội dung</label>
          <AdminTextarea
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            rows={4}
            placeholder="Tóm tắt bài học hoặc nội dung đọc."
          />
        </div>
      </div>
    </AdminModal>
    <LessonConfirmDialogHost />
    </>
  )
}

function QuizFormModal({
  state,
  courseId,
  chapterId,
  lessonId,
  onClose,
  onCreated,
}: {
  state: Exclude<QuizModalState, null>
  courseId: number
  chapterId: number
  lessonId: number
  onClose: () => void
  onCreated: (quizId: number) => void
}) {
  const queryClient = useQueryClient()
  const initial = state.quiz
  const [timeLimit, setTimeLimit] = useState(String(initial?.timeLimit ?? 15))
  const [passScore, setPassScore] = useState(String(initial?.passScore ?? 5))

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        timeLimit: timeLimit ? Number(timeLimit) : undefined,
        passScore: Number(passScore),
      }
      return initial
        ? teacherApi.quizzes.update(courseId, chapterId, lessonId, initial.id, payload)
        : teacherApi.quizzes.create(courseId, chapterId, lessonId, payload)
    },
    onSuccess: (quiz) => {
      notify.success(initial ? 'Đã cập nhật quiz' : 'Đã tạo quiz')
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes', courseId, chapterId, lessonId] })
      if (!initial) onCreated(quiz.id)
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  return (
    <AdminModal
      open
      title={initial ? 'Sửa quiz' : 'Tạo quiz'}
      description="passScore là bắt buộc theo CreateQuizRequest."
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={Number(passScore) < 0}
          submitLabel={initial ? 'Lưu' : 'Tạo quiz'}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Thời gian (phút)"
          type="number"
          min={1}
          value={timeLimit}
          onChange={(event) => setTimeLimit(event.target.value)}
        />
        <Input
          label="Điểm đạt"
          type="number"
          min={0}
          value={passScore}
          onChange={(event) => setPassScore(event.target.value)}
        />
      </div>
    </AdminModal>
  )
}

function QuizImportModal({
  courseId,
  chapterId,
  lessonId,
  onClose,
  onCreated,
}: {
  courseId: number
  chapterId: number
  lessonId: number
  onClose: () => void
  onCreated: (quizId: number) => void
}) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [timeLimit, setTimeLimit] = useState('15')
  const [passScore, setPassScore] = useState('5')

  const mutation = useMutation({
    mutationFn: () =>
      teacherApi.quizzes.importDocument(courseId, chapterId, lessonId, {
        file: file!,
        timeLimit: timeLimit ? Number(timeLimit) : undefined,
        passScore: Number(passScore),
      }),
    onSuccess: (quiz) => {
      notify.success('Import quiz thành công')
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'quizzes', courseId, chapterId, lessonId] })
      onCreated(quiz.id)
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  return (
    <AdminModal
      open
      title="Import quiz từ tài liệu"
      description="Backend nhận multipart/form-data với file, timeLimit và passScore."
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!file || Number(passScore) < 0}
          submitLabel="Import quiz"
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="File .docx hoặc .txt"
          type="file"
          accept=".docx,.txt"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Thời gian (phút)"
            type="number"
            min={1}
            value={timeLimit}
            onChange={(event) => setTimeLimit(event.target.value)}
          />
          <Input
            label="Điểm đạt"
            type="number"
            min={0}
            value={passScore}
            onChange={(event) => setPassScore(event.target.value)}
          />
        </div>
      </div>
    </AdminModal>
  )
}

function QuestionFormModal({
  state,
  courseId,
  chapterId,
  lessonId,
  quizId,
  nextOrder,
  onClose,
}: {
  state: Exclude<QuestionModalState, null>
  courseId: number
  chapterId: number
  lessonId: number
  quizId: number
  nextOrder: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const initial = state.question
  const [content, setContent] = useState(initial?.content ?? '')
  const [score, setScore] = useState(String(initial?.score ?? 1))
  const [orderIndex, setOrderIndex] = useState(String(initial?.orderIndex ?? nextOrder))
  const [options, setOptions] = useState(
    initial?.options.map((option) => ({ content: option.content, isCorrect: Boolean(option.isCorrect) })) ?? [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
    ],
  )

  const validOptions = useMemo(() => options.filter((option) => option.content.trim()), [options])
  const hasCorrect = validOptions.some((option) => option.isCorrect)

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        content: content.trim(),
        score: Number(score),
        orderIndex: Number(orderIndex),
        options: validOptions.map((option) => ({
          content: option.content.trim(),
          isCorrect: option.isCorrect,
        })),
      }
      return initial
        ? teacherApi.quizzes.updateQuestion(courseId, chapterId, lessonId, quizId, initial.id, payload)
        : teacherApi.quizzes.createQuestion(courseId, chapterId, lessonId, quizId, payload)
    },
    onSuccess: () => {
      notify.success(initial ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi')
      void queryClient.invalidateQueries({
        queryKey: ['teacher', 'questions', courseId, chapterId, lessonId, quizId],
      })
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  return (
    <AdminModal
      open
      title={initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
      description="Frontend gửi content, score, orderIndex và options đúng DTO."
      onClose={onClose}
      size="lg"
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!content.trim() || validOptions.length < 2 || !hasCorrect}
          submitLabel={initial ? 'Lưu' : 'Thêm câu hỏi'}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Nội dung câu hỏi</label>
          <AdminTextarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Điểm" type="number" min={0} value={score} onChange={(event) => setScore(event.target.value)} />
          <Input
            label="Thứ tự"
            type="number"
            min={1}
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#374151]">Đáp án</p>
          {options.map((option, index) => (
            <label
              key={index}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition',
                option.isCorrect
                  ? 'border-[#f05123]/35 bg-[#fff8f5]'
                  : 'border-[#ececec] hover:bg-[#fafafa]',
              )}
            >
              <input
                type="radio"
                name="teacher-correct-answer"
                checked={option.isCorrect}
                onChange={() =>
                  setOptions(options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })))
                }
                className="text-[#f05123] focus:ring-[#f05123]/25"
              />
              <input
                value={option.content}
                onChange={(event) => {
                  const next = [...options]
                  next[index] = { ...next[index], content: event.target.value }
                  setOptions(next)
                }}
                placeholder={`Đáp án ${index + 1}`}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
              />
            </label>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOptions([...options, { content: '', isCorrect: false }])}
          >
            Thêm đáp án
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}

function NotificationModal({
  target,
  onClose,
  onSuccess,
}: {
  target: NotificationTarget
  onClose: () => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (target.kind === 'course') {
        await teacherApi.courses.notifyCourse(target.course.id, { message: message.trim() })
        return
      }

      await teacherApi.courses.notifyStudent(target.course.id, target.student.studentId, {
        message: message.trim(),
      })
    },
    onSuccess: () => {
      notify.success('Đã gửi thông báo')
      onSuccess()
      onClose()
    },
    onError: (error) => notify.error(getErrorMessage(error)),
  })

  const title =
    target.kind === 'course'
      ? `Thông báo cả lớp: ${target.course.title}`
      : `Thông báo riêng: ${target.student.fullName || target.student.username}`

  return (
    <AdminModal
      open
      title={title}
      description="Nội dung gửi theo CreateNotificationRequest với field message."
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!message.trim()}
          submitLabel="Gửi thông báo"
        />
      }
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">Nội dung thông báo</label>
        <AdminTextarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="VD: Lớp mình hoàn thành bài 1.2 trước tối nay nhé."
        />
      </div>
    </AdminModal>
  )
}
