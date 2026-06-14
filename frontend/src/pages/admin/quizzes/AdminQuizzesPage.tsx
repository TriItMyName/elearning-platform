import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { chaptersApi } from '@/api/chapters.api'
import { coursesApi } from '@/api/courses.api'
import { lessonsApi } from '@/api/lessons.api'
import { quizzesApi } from '@/api/quizzes.api'
import {
  AdminCard,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTableWrap,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { Question, Quiz } from '@/types/quiz'

export function AdminQuizzesPage() {
  const [courseId, setCourseId] = useState<number | null>(null)
  const [chapterId, setChapterId] = useState<number | null>(null)
  const [lessonId, setLessonId] = useState<number | null>(null)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['courses', 'admin-quizzes'],
    queryFn: () => coursesApi.list({ page: 0, size: 100 }),
  })

  const chaptersQuery = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => chaptersApi.listByCourse(courseId!, { page: 0, size: 100 }),
    enabled: courseId != null,
  })

  const lessonsQuery = useQuery({
    queryKey: ['lessons', courseId, chapterId],
    queryFn: () => lessonsApi.listByChapter(courseId!, chapterId!, { page: 0, size: 100 }),
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

  const ready = courseId != null && chapterId != null && lessonId != null

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Quiz"
        description="Chọn khóa học → chương → bài học → quiz → câu hỏi"
      />

      <AdminCard className="mb-4 grid gap-4 p-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#666]">Khóa học</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => {
              setCourseId(Number(e.target.value) || null)
              setChapterId(null)
              setLessonId(null)
              setQuizId(null)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Chọn khóa học</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#666]">Chương</label>
          <select
            value={chapterId ?? ''}
            disabled={!courseId}
            onChange={(e) => {
              setChapterId(Number(e.target.value) || null)
              setLessonId(null)
              setQuizId(null)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Chọn chương</option>
            {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#666]">Bài học</label>
          <select
            value={lessonId ?? ''}
            disabled={!chapterId}
            onChange={(e) => {
              setLessonId(Number(e.target.value) || null)
              setQuizId(null)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Chọn bài học</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </AdminCard>

      {ready ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminCard>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
              <h2 className="font-bold">Quiz</h2>
              <Button className="!bg-[#f05123] !px-3 !py-1.5 !text-xs" onClick={() => setQuizModalOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
              </Button>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {quizzes.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[#999]">Chưa có quiz</p>
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={[
                      'flex items-center gap-2 px-4 py-3 text-sm',
                      quizId === quiz.id ? 'bg-[#fff4f0] font-semibold text-[#f05123]' : '',
                    ].join(' ')}
                  >
                    <button type="button" className="flex-1 text-left" onClick={() => setQuizId(quiz.id)}>
                      Quiz #{quiz.id} — {quiz.timeLimit ?? '∞'} phút — đạt {quiz.passScore ?? 0}%
                    </button>
                    <button type="button" onClick={() => setEditQuiz(quiz)} className="rounded p-1.5 hover:bg-[#f0f0f0]">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Xóa quiz này?')) deleteQuizMutation.mutate(quiz.id)
                      }}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
              <h2 className="font-bold">Câu hỏi</h2>
              <Button
                className="!bg-[#f05123] !px-3 !py-1.5 !text-xs"
                disabled={!quizId}
                onClick={() => setQuestionModalOpen(true)}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
              </Button>
            </div>
            {!quizId ? (
              <p className="px-4 py-8 text-center text-sm text-[#999]">Chọn một quiz</p>
            ) : (
              <AdminTableWrap>
                <AdminTable>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {questions.map((q) => (
                      <tr key={q.id}>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-medium">{q.content}</p>
                          <p className="mt-1 text-xs text-[#999]">{q.options.length} đáp án — {q.score} điểm</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => setEditQuestion(q)} className="rounded p-1.5 hover:bg-[#f0f0f0]">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Xóa câu hỏi?')) deleteQuestionMutation.mutate(q.id)
                              }}
                              className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            )}
          </AdminCard>
        </div>
      ) : null}

      {ready && quizModalOpen ? (
        <QuizFormModal
          open
          courseId={courseId}
          chapterId={chapterId}
          lessonId={lessonId}
          onClose={() => setQuizModalOpen(false)}
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
}: {
  open: boolean
  courseId: number
  chapterId: number
  lessonId: number
  initial?: Quiz
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [timeLimit, setTimeLimit] = useState(String(initial?.timeLimit ?? 30))
  const [passScore, setPassScore] = useState(String(initial?.passScore ?? 70))

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        timeLimit: Number(timeLimit) || undefined,
        passScore: Number(passScore) || undefined,
      }
      return initial
        ? quizzesApi.update(courseId, chapterId, lessonId, initial.id, payload)
        : quizzesApi.create(courseId, chapterId, lessonId, payload)
    },
    onSuccess: () => {
      notify.success(initial ? 'Cập nhật quiz thành công' : 'Tạo quiz thành công')
      void queryClient.invalidateQueries({ queryKey: ['quizzes', courseId, chapterId, lessonId] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  return (
    <AdminModal
      open={open}
      title={initial ? 'Sửa quiz' : 'Thêm quiz'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Lưu</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Thời gian (phút)" type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
        <Input label="Điểm đạt (%)" type="number" value={passScore} onChange={(e) => setPassScore(e.target.value)} />
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
  const [content, setContent] = useState(initial?.content ?? '')
  const [score, setScore] = useState(String(initial?.score ?? 1))
  const [orderIndex, setOrderIndex] = useState(String(initial?.orderIndex ?? nextOrder))
  const [options, setOptions] = useState(
    initial?.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect })) ?? [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
    ],
  )

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        content,
        score: Number(score),
        orderIndex: Number(orderIndex),
        options: options.filter((o) => o.content.trim()),
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
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button className="!bg-[#f05123]" isLoading={mutation.isPending} onClick={() => mutation.mutate()} disabled={!content}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung câu hỏi</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Điểm" type="number" value={score} onChange={(e) => setScore(e.target.value)} />
          <Input label="Thứ tự" type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Đáp án</p>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={opt.isCorrect}
                onChange={() => setOptions(options.map((o, j) => ({ ...o, isCorrect: j === i })))}
              />
              <input
                value={opt.content}
                onChange={(e) => {
                  const next = [...options]
                  next[i] = { ...next[i], content: e.target.value }
                  setOptions(next)
                }}
                placeholder={`Đáp án ${i + 1}`}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => setOptions([...options, { content: '', isCorrect: false }])}
          >
            Thêm đáp án
          </Button>
        </div>
      </div>
    </AdminModal>
  )
}
