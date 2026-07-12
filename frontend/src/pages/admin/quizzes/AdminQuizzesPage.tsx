import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ChevronRight,
  Layers,
  Pencil,
  Import,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import { quizzesApi } from '@/api/quizzes.api'
import type { AdminCourseOutletContext } from '@/components/admin/AdminCourseLayout'
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
  AdminPickerRow,
  AdminPickerSection,
  AdminStepper,
  AdminTextarea,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useAdminCourseRoute } from '@/hooks/useAdminCourseRoute'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { Question, Quiz } from '@/types/quiz'
import { LESSON_TYPE_LABEL } from '@/types/lesson'

type PickerStep = 'course' | 'chapter' | 'lesson'

const STEPS: Array<{ id: PickerStep | 'workspace'; label: string }> = [
  { id: 'course', label: 'Khóa học' },
  { id: 'chapter', label: 'Chương' },
  { id: 'lesson', label: 'Bài học' },
  { id: 'workspace', label: 'Soạn quiz' },
]

export function AdminQuizzesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const { courseId: routeCourseId, isCourseScoped, exitCourseScope } = useAdminCourseRoute()
  const { course: scopedCourse } = useOutletContext<AdminCourseOutletContext>()
  const [courseId, setCourseId] = useState<number | null>(routeCourseId)
  const [chapterId, setChapterId] = useState<number | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const importMutation = useMutation({
    mutationFn: (file: File) =>
      quizzesApi.importDocument(courseId!, chapterId!, lessonId!, { file, passScore: 7 }),
    onSuccess: () => {
      notify.success('Import quiz từ tài liệu thành công')
      void queryClient.invalidateQueries({ queryKey: ['quizzes', courseId, chapterId, lessonId] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses', 'quiz-picker'],
    queryFn: () => adminApi.courses.list({ page: 0, size: 100 }),
    enabled: !isCourseScoped,
  })

  const chaptersQuery = useQuery({
    queryKey: ['admin', 'chapters', courseId],
    queryFn: () => adminApi.chapters.list({ courseId: courseId!, page: 0, size: 100 }),
    enabled: courseId != null,
  })

  const lessonsQuery = useQuery({
    queryKey: ['admin', 'lessons', courseId, chapterId],
    queryFn: () => adminApi.lessons.list({ chapterId: chapterId!, page: 0, size: 100 }),
    enabled: courseId != null && chapterId != null,
  })

  const quizzesQuery = useQuery({
    queryKey: ['quizzes', courseId, chapterId, lessonId],
    queryFn: () => quizzesApi.listByLesson(courseId!, chapterId!, lessonId!),
    enabled: courseId != null && chapterId != null && lessonId != null,
  })

  const questionsQuery = useQuery({
    queryKey: ['questions', courseId, chapterId, lessonId, quizId],
    queryFn: () => quizzesApi.listQuestions(courseId!, chapterId!, lessonId!, quizId!),
    enabled: courseId != null && chapterId != null && lessonId != null && quizId != null,
  })

  const queryClient = useQueryClient()

  const deleteQuizMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.delete(courseId!, chapterId!, lessonId!, id),
    onSuccess: () => {
      notify.success('Xóa quiz thành công')
      void queryClient.invalidateQueries({ queryKey: ['quizzes', courseId, chapterId, lessonId] })
      setQuizId(null)
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.deleteQuestion(courseId!, chapterId!, lessonId!, quizId!, id),
    onSuccess: () => {
      notify.success('Xóa câu hỏi thành công')
      void queryClient.invalidateQueries({ queryKey: ['questions', courseId, chapterId, lessonId, quizId] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const courses = coursesQuery.data?.content ?? []
  const chapters = chaptersQuery.data?.content ?? []
  const lessons = lessonsQuery.data?.content ?? []
  const quizzes = quizzesQuery.data ?? []
  const questions = questionsQuery.data ?? []

  const selectedCourse = isCourseScoped
    ? scopedCourse ?? courses.find((c) => c.id === courseId)
    : courses.find((c) => c.id === courseId)
  const selectedChapter = chapters.find((c) => c.id === chapterId)
  const selectedLesson = lessons.find((l) => l.id === lessonId)
  const selectedQuiz = quizzes.find((q) => q.id === quizId)

  const currentStep: PickerStep | 'workspace' = !courseId
    ? 'course'
    : !chapterId
      ? 'chapter'
      : !lessonId
        ? 'lesson'
        : 'workspace'

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)

  useEffect(() => {
    if (routeCourseId != null) setCourseId(routeCourseId)
  }, [routeCourseId])

  useEffect(() => {
    if (!lessonId || quizzes.length === 0) return
    if (quizId == null || !quizzes.some((q) => q.id === quizId)) {
      setQuizId(quizzes[0].id)
    }
  }, [lessonId, quizzes, quizId])

  useEffect(() => {
    if (!isCourseScoped) return
    if (chapters.length === 0) {
      setChapterId(null)
      return
    }
    if (chapterId == null || !chapters.some((c) => c.id === chapterId)) {
      setChapterId(chapters[0].id)
    }
  }, [isCourseScoped, chapters, chapterId])

  useEffect(() => {
    if (!isCourseScoped) return
    if (!chapterId || lessons.length === 0) {
      setLessonId(null)
      return
    }
    if (lessonId == null || !lessons.some((l) => l.id === lessonId)) {
      setLessonId(lessons[0].id)
    }
  }, [isCourseScoped, chapterId, lessons, lessonId])

  const ready = courseId != null && chapterId != null && lessonId != null

  const resetFrom = (step: PickerStep) => {
    if (step === 'course') {
      if (isCourseScoped) {
        exitCourseScope()
        return
      }
      setCourseId(null)
      setChapterId(null)
      setLessonId(null)
      setQuizId(null)
      return
    }
    if (step === 'chapter') {
      setChapterId(null)
      setLessonId(null)
      setQuizId(null)
      return
    }
    setLessonId(null)
    setQuizId(null)
  }

  const visibleSteps = isCourseScoped ? STEPS.filter((step) => step.id !== 'course') : STEPS

  return (
    <div>
      {!isCourseScoped ? (
        <AdminPageHeader
          title="Quiz & câu hỏi"
          description="Chọn bài học rồi tạo quiz và câu hỏi trắc nghiệm. Luồng: khóa học → chương → bài học → soạn nội dung."
        />
      ) : null}

      {!isCourseScoped ? (
        <AdminCard className="mb-6" padding>
          <AdminStepper steps={visibleSteps} currentIndex={Math.max(stepIndex - (isCourseScoped ? 1 : 0), 0)} />

          {currentStep === 'workspace' && selectedCourse && selectedChapter && selectedLesson ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ececec] pt-4 text-sm">
              <span className="text-[#6b7280]">Đang soạn:</span>
              <button type="button" onClick={() => resetFrom('course')} className="font-medium text-[#f05123] hover:underline">
                {selectedCourse.title}
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#d1d5db]" />
              <button type="button" onClick={() => resetFrom('chapter')} className="font-medium text-[#f05123] hover:underline">
                {selectedChapter.title}
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#d1d5db]" />
              <button type="button" onClick={() => resetFrom('lesson')} className="font-medium text-[#f05123] hover:underline">
                {selectedLesson.title}
              </button>
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      {!isCourseScoped && currentStep === 'course' ? (
        <AdminPickerSection
          title="Bước 1 — Chọn khóa học"
          description="Quiz được gắn vào một bài học cụ thể trong khóa."
          loading={coursesQuery.isLoading}
          isEmpty={courses.length === 0}
          empty="Chưa có khóa học nào."
        >
          {courses.map((course) => (
            <AdminPickerRow
              key={course.id}
              icon={BookOpen}
              title={course.title}
              meta={course.slug}
              onClick={() => setCourseId(course.id)}
            />
          ))}
        </AdminPickerSection>
      ) : null}

      {!isCourseScoped && currentStep === 'chapter' && selectedCourse ? (
        <AdminPickerSection
          title={isCourseScoped ? 'Chọn chương' : 'Bước 2 — Chọn chương'}
          description={`Khóa học: ${selectedCourse.title}`}
          loading={chaptersQuery.isLoading}
          isEmpty={chapters.length === 0}
          empty="Khóa này chưa có chương."
          onBack={isCourseScoped ? undefined : () => resetFrom('course')}
        >
          {chapters.map((chapter) => (
            <AdminPickerRow
              key={chapter.id}
              icon={Layers}
              title={chapter.title}
              meta={`Thứ tự ${chapter.orderIndex}`}
              onClick={() => setChapterId(chapter.id)}
            />
          ))}
        </AdminPickerSection>
      ) : null}

      {!isCourseScoped && currentStep === 'lesson' && selectedChapter ? (
        <AdminPickerSection
          title="Bước 3 — Chọn bài học"
          description={`Chương: ${selectedChapter.title}`}
          loading={lessonsQuery.isLoading}
          isEmpty={lessons.length === 0}
          empty="Chương này chưa có bài học."
          onBack={() => resetFrom('chapter')}
        >
          {lessons.map((lesson) => (
            <AdminPickerRow
              key={lesson.id}
              icon={Video}
              title={lesson.title}
              meta={LESSON_TYPE_LABEL[lesson.lessonType] ?? 'Bài học'}
              onClick={() => setLessonId(lesson.id)}
            />
          ))}
        </AdminPickerSection>
      ) : null}

      {isCourseScoped && (
        <AdminCard className="mb-4" padding>
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Chương</label>
              <AdminNativeSelect
                value={chapterId ?? ''}
                onChange={(e) => {
                  setChapterId(e.target.value ? Number(e.target.value) : null)
                  setLessonId(null)
                  setQuizId(null)
                }}
              >
                <option value="">Chọn chương</option>
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
                value={lessonId ?? ''}
                onChange={(e) => {
                  setLessonId(e.target.value ? Number(e.target.value) : null)
                  setQuizId(null)
                }}
                disabled={!chapterId}
              >
                <option value="">{chapterId ? 'Chọn bài học' : 'Chọn chương trước'}</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </AdminNativeSelect>
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1" disabled={!selectedLesson} onClick={() => setQuizModalOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Tạo quiz
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={!selectedLesson || importMutation.isPending}
                onClick={() => importInputRef.current?.click()}
              >
                <Import className="mr-1.5 h-4 w-4" />
                {importMutation.isPending ? 'Đang import...' : 'Import'}
              </Button>
              <input
                ref={importInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) importMutation.mutate(file)
                }}
              />
            </div>
          </div>
        </AdminCard>
      )}

      {(isCourseScoped ? Boolean(chapterId && lessonId) : currentStep === 'workspace') && ready ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,320px)_1fr]">
          <AdminPanel
            title="Danh sách quiz"
            action={
              isCourseScoped ? undefined : (
                <Button size="sm" onClick={() => setQuizModalOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tạo
                </Button>
              )
            }
          >
            {quizzesQuery.isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải quiz...</p>
            ) : quizzes.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-[#6b7280]">Bài học này chưa có quiz.</p>
                <Button size="sm" className="mt-3" onClick={() => setQuizModalOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tạo quiz đầu tiên
                </Button>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <AdminListItem
                  key={quiz.id}
                  active={quizId === quiz.id}
                  onClick={() => setQuizId(quiz.id)}
                  actions={
                    <>
                      <AdminIconButton title="Sửa quiz" onClick={() => setEditQuiz(quiz)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </AdminIconButton>
                      <AdminIconButton
                        title="Xóa quiz"
                        variant="danger"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Xóa quiz',
                            description: 'Bạn có chắc muốn xóa quiz này? Toàn bộ câu hỏi bên trong cũng sẽ bị xóa.',
                            confirmLabel: 'Xóa',
                          })
                          if (ok) deleteQuizMutation.mutate(quiz.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </AdminIconButton>
                    </>
                  }
                >
                  <span className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center">
                    <span className="font-medium">Quiz #{quiz.id}</span>
                    <span className="flex gap-1.5">
                      <AdminBadge tone="accent">{quiz.timeLimit ?? '∞'} phút</AdminBadge>
                      <AdminBadge>{quiz.passScore ?? 0} điểm</AdminBadge>
                    </span>
                  </span>
                </AdminListItem>
              ))
            )}
          </AdminPanel>

          <div className="space-y-4">
            {isCourseScoped ? null : selectedQuiz ? (
              <AdminCard padding>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-[#f05123] uppercase">Quiz đang chọn</p>
                    <h2 className="mt-1 text-lg font-bold text-[#111827]">Quiz #{selectedQuiz.id}</h2>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      Thời gian {selectedQuiz.timeLimit ?? '∞'} phút · Điểm đạt {selectedQuiz.passScore ?? 0} điểm
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setEditQuiz(selectedQuiz)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Sửa cài đặt
                  </Button>
                </div>
              </AdminCard>
            ) : null}

            <AdminPanel
              title={`Câu hỏi (${questions.length})`}
              action={
                <Button size="sm" disabled={!quizId} onClick={() => setQuestionModalOpen(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Thêm câu hỏi
                </Button>
              }
            >
              {!quizId ? (
                <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Chọn một quiz bên trái.</p>
              ) : questionsQuery.isLoading ? (
                <p className="px-4 py-10 text-center text-sm text-[#9ca3af]">Đang tải câu hỏi...</p>
              ) : questions.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-[#6b7280]">Quiz này chưa có câu hỏi.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f3f4f6]">
                  {questions.map((q, index) => (
                    <QuestionCard
                      key={q.id}
                      index={index}
                      question={q}
                      onEdit={() => setEditQuestion(q)}
                      onDelete={async () => {
                        const ok = await confirm({
                          title: 'Xóa câu hỏi',
                          description: 'Bạn có chắc muốn xóa câu hỏi này?',
                          confirmLabel: 'Xóa',
                        })
                        if (ok) deleteQuestionMutation.mutate(q.id)
                      }}
                    />
                  ))}
                </div>
              )}
            </AdminPanel>
          </div>
        </div>
      ) : null}

      {ready && quizModalOpen ? (
        <QuizFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          lessonId={lessonId}
          onClose={() => setQuizModalOpen(false)}
          onCreated={(id) => setQuizId(id)}
        />
      ) : null}
      {ready && editQuiz ? (
        <QuizFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          lessonId={lessonId}
          initial={editQuiz}
          onClose={() => setEditQuiz(null)}
        />
      ) : null}
      {ready && quizId && questionModalOpen ? (
        <QuestionFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          lessonId={lessonId}
          quizId={quizId}
          nextOrder={questions.length}
          onClose={() => setQuestionModalOpen(false)}
        />
      ) : null}
      {ready && quizId && editQuestion ? (
        <QuestionFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          lessonId={lessonId}
          quizId={quizId}
          initial={editQuestion}
          onClose={() => setEditQuestion(null)}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function QuestionCard({
  index,
  question,
  onEdit,
  onDelete,
}: {
  index: number
  question: Question
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#9ca3af]">Câu {index + 1} · {question.score} điểm</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-[#111827]">{question.content}</p>
          <ul className="mt-3 space-y-1.5">
            {question.options.map((opt) => (
              <li
                key={opt.id}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm',
                  opt.isCorrect
                    ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
                    : 'border-[#ececec] bg-[#fcfcfc] text-[#374151]',
                )}
              >
                {opt.content}
                {opt.isCorrect ? (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[#059669]">Đúng</span>
                ) : null}
              </li>
            ))}
          </ul>
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

function QuizFormModal({
  open,
  courseId,
  chapterId,
  lessonId,
  initial,
  onClose,
  onCreated,
}: {
  open: boolean
  courseId: number
  chapterId: number
  lessonId: number
  initial?: Quiz
  onClose: () => void
  onCreated?: (quizId: number) => void
}) {
  const queryClient = useQueryClient()
  const [timeLimit, setTimeLimit] = useState(String(initial?.timeLimit ?? 30))
  const [passScore, setPassScore] = useState(String(initial?.passScore ?? 5))

  useEffect(() => {
    if (!open) return
    setTimeLimit(String(initial?.timeLimit ?? 30))
    setPassScore(String(initial?.passScore ?? 5))
  }, [open, initial])

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        timeLimit: Number(timeLimit) || undefined,
        passScore: Number(passScore) || 0,
      }
      return initial
        ? quizzesApi.update(courseId, chapterId, lessonId, initial.id, payload)
        : quizzesApi.create(courseId, chapterId, lessonId, payload)
    },
    onSuccess: (data) => {
      notify.success(initial ? 'Cập nhật quiz thành công' : 'Tạo quiz thành công')
      void queryClient.invalidateQueries({ queryKey: ['quizzes', courseId, chapterId, lessonId] })
      if (!initial && data?.id) onCreated?.(data.id)
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa cài đặt quiz' : 'Tạo quiz mới'}
      description="Thiết lập thời gian làm bài và điểm tối thiểu để đạt."
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitLabel={initial ? 'Lưu' : 'Tạo quiz'}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Thời gian (phút)" type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
        <Input label="Điểm đạt" type="number" min={0} value={passScore} onChange={(e) => setPassScore(e.target.value)} />
      </div>
    </AdminModal>
  )
}

function QuestionFormModal({
  open,
  courseId,
  chapterId,
  lessonId,
  quizId,
  initial,
  nextOrder = 0,
  onClose,
}: {
  open: boolean
  courseId: number
  chapterId: number
  lessonId: number
  quizId: number
  initial?: Question
  nextOrder?: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [score, setScore] = useState('1')
  const [orderIndex, setOrderIndex] = useState('0')
  const [options, setOptions] = useState([
    { content: '', isCorrect: true },
    { content: '', isCorrect: false },
  ])

  useEffect(() => {
    if (!open) return
    setContent(initial?.content ?? '')
    setScore(String(initial?.score ?? 1))
    setOrderIndex(String(initial?.orderIndex ?? nextOrder))
    setOptions(
      initial?.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect })) ?? [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
      ],
    )
  }, [open, initial, nextOrder])

  const validOptions = useMemo(() => options.filter((o) => o.content.trim()), [options])
  const hasCorrect = validOptions.some((o) => o.isCorrect)

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        content,
        score: Number(score),
        orderIndex: Number(orderIndex),
        options: validOptions,
      }
      return initial
        ? quizzesApi.updateQuestion(courseId, chapterId, lessonId, quizId, initial.id, payload)
        : quizzesApi.createQuestion(courseId, chapterId, lessonId, quizId, payload)
    },
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật câu hỏi thành công' : 'Tạo câu hỏi thành công')
      void queryClient.invalidateQueries({ queryKey: ['questions', courseId, chapterId, lessonId, quizId] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
      description="Nhập nội dung, chọn một đáp án đúng và thiết lập điểm."
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
          <AdminTextarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Điểm" type="number" min={1} value={score} onChange={(e) => setScore(e.target.value)} />
          <Input label="Thứ tự" type="number" min={0} value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#374151]">Đáp án — chọn một đáp án đúng</p>
          {options.map((opt, i) => (
            <label
              key={i}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition',
                opt.isCorrect ? 'border-[#f05123]/35 bg-[#fff8f5]' : 'border-[#ececec] hover:bg-[#fafafa]',
              )}
            >
              <input
                type="radio"
                name="correct-answer"
                checked={opt.isCorrect}
                onChange={() => setOptions(options.map((o, j) => ({ ...o, isCorrect: j === i })))}
                className="text-[#f05123] focus:ring-[#f05123]/25"
              />
              <input
                value={opt.content}
                onChange={(e) => {
                  const next = [...options]
                  next[i] = { ...next[i], content: e.target.value }
                  setOptions(next)
                }}
                placeholder={`Đáp án ${i + 1}`}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
              />
            </label>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setOptions([...options, { content: '', isCorrect: false }])}>
            Thêm đáp án
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
