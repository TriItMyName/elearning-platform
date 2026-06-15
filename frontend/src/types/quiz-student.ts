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
  passScore: number | null
  questions: StudentQuestion[]
}

export interface QuizAnswerPayload {
  questionId: number
  optionId: number
}

export interface SubmitQuizPayload {
  quizId: number
  lessonId: number
  courseId: number
  answers: QuizAnswerPayload[]
}

export interface SubmitQuizResult {
  quizId: number
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  correctCount: number
  totalQuestions: number
}
