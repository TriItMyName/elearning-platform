import type {
  StudentQuiz,
  SubmitQuizPayload,
  SubmitQuizResult,
} from '@/types/quiz-student'

const QUIZZES: Record<number, StudentQuiz & { _answers: Record<number, number> }> = {
  102: {
    id: 1,
    lessonId: 102,
    timeLimit: 15,
    passScore: 70,
    createdAt: new Date(0).toISOString(),
    questions: [
      {
        id: 1,
        content: 'React là thư viện JavaScript dùng để làm gì?',
        score: 1,
        orderIndex: 0,
        options: [
          { id: 1, content: 'Xây dựng giao diện người dùng' },
          { id: 2, content: 'Quản lý cơ sở dữ liệu' },
          { id: 3, content: 'Cấu hình server' },
        ],
      },
      {
        id: 2,
        content: 'Hook nào dùng để quản lý state trong functional component?',
        score: 1,
        orderIndex: 1,
        options: [
          { id: 4, content: 'useState' },
          { id: 5, content: 'useRouter' },
          { id: 6, content: 'useDatabase' },
        ],
      },
    ],
    _answers: { 1: 1, 2: 4 },
  },
  201: {
    id: 2,
    lessonId: 201,
    timeLimit: 10,
    passScore: 60,
    createdAt: new Date(0).toISOString(),
    questions: [
      {
        id: 3,
        content: 'API mock được tắt bằng biến môi trường nào?',
        score: 2,
        orderIndex: 0,
        options: [
          { id: 7, content: 'VITE_MOCK_QUIZ_STUDENT=false' },
          { id: 8, content: 'VITE_DISABLE_MOCK' },
          { id: 9, content: 'REACT_APP_MOCK=0' },
        ],
      },
    ],
    _answers: { 3: 7 },
  },
}

export const quizStudentMockApi = {
  getByLesson(lessonId: number): Promise<StudentQuiz | null> {
    const raw = QUIZZES[lessonId]
    if (!raw) return Promise.resolve(null)
    const { _answers: _, ...quiz } = raw
    void _
    return Promise.resolve(structuredClone(quiz))
  },

  submit(lessonId: number, payload: SubmitQuizPayload): Promise<SubmitQuizResult> {
    const raw = QUIZZES[lessonId]
    if (!raw) throw new Error('Quiz not found')

    let score = 0
    let maxScore = 0

    for (const q of raw.questions) {
      maxScore += q.score
      const correctOptionId = raw._answers[q.id]
      const answer = payload.answers.find((a) => a.questionId === q.id)
      if (answer && answer.optionId === correctOptionId) {
        score += q.score
      }
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    const passed = percentage >= (raw.passScore ?? 0)

    return Promise.resolve({
      id: Date.now(),
      courseId: 0,
      lessonId,
      quizId: raw.id,
      studentId: 0,
      totalScore: score,
      passScore: raw.passScore,
      passed,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    })
  },
}
