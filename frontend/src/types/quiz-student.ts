export interface StudentQuestionOption {
  id: number
  content: string
}

export interface StudentQuestion {
  id: number
  content: string
  score: number
  orderIndex: number
  options: StudentQuestionOption[]
}

export interface StudentQuiz {
  id: number
  lessonId: number
  timeLimit: number | null
  passScore: number
  createdAt: string
  questions: StudentQuestion[]
}

export interface QuizAnswerPayload {
  questionId: number
  optionId: number
}

export interface SubmitQuizPayload {
  answers: QuizAnswerPayload[]
}

export interface SubmitQuizResult {
  id: number
  courseId: number
  lessonId: number
  quizId: number
  studentId: number
  totalScore: number
  passScore: number
  passed: boolean
  startedAt: string
  completedAt: string
}

export type QuizAttempt = SubmitQuizResult
