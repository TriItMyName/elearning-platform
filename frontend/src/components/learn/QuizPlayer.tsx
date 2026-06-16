import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'

import { quizStudentApi } from '@/api/quiz-student.api'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { StudentQuiz, SubmitQuizResult } from '@/types/quiz-student'

interface QuizPlayerProps {
  courseId: number
  chapterId: number
  lessonId: number
  quiz: StudentQuiz
  onComplete?: (result: SubmitQuizResult) => void
}

export function QuizPlayer({ courseId, chapterId, lessonId, quiz, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<SubmitQuizResult | null>(null)

  const allAnswered = useMemo(
    () => quiz.questions.every((q) => answers[q.id] != null),
    [quiz.questions, answers],
  )

  const submitMutation = useMutation({
    mutationFn: () =>
      quizStudentApi.submit(courseId, chapterId, lessonId, {
        quizId: quiz.id,
        lessonId,
        courseId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId,
        })),
      }),
    onSuccess: (data) => {
      setResult(data)
      onComplete?.(data)
      notify.success(data.passed ? 'Chúc mừng! Bạn đã đạt quiz.' : 'Đã nộp bài. Hãy ôn lại và thử lại.')
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  if (result) {
    return (
      <div className="rounded-2xl border border-[#ececec] bg-white p-8 text-center">
        {result.passed ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        ) : (
          <XCircle className="mx-auto h-14 w-14 text-amber-500" />
        )}
        <h2 className="mt-4 text-xl font-bold text-[#111827]">
          {result.passed ? 'Đạt quiz!' : 'Chưa đạt yêu cầu'}
        </h2>
        <p className="mt-2 text-[#6b7280]">
          {result.correctCount}/{result.totalQuestions} câu đúng · {result.percentage}% · {result.score}/{result.maxScore} điểm
        </p>
        <Button className="mt-6" variant="secondary" onClick={() => { setResult(null); setAnswers({}) }}>
          Làm lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b7280]">
        {quiz.timeLimit ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {quiz.timeLimit} phút
          </span>
        ) : null}
        <span>Điểm đạt: {quiz.passScore ?? 0}%</span>
        <span>{quiz.questions.length} câu hỏi</span>
      </div>

      {quiz.questions.map((q, index) => (
        <div key={q.id} className="rounded-2xl border border-[#ececec] bg-white p-5">
          <p className="text-xs font-semibold text-[#f05123]">Câu {index + 1}</p>
          <p className="mt-1 font-medium text-[#111827]">{q.content}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition',
                  answers[q.id] === opt.id
                    ? 'border-[#f05123]/40 bg-[#fff8f5]'
                    : 'border-[#ececec] hover:bg-[#fafafa]',
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  className="text-[#f05123]"
                />
                {opt.content}
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button
        className="w-full sm:w-auto"
        disabled={!allAnswered || submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
      >
        Nộp bài
      </Button>
    </div>
  )
}
