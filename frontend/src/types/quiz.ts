export interface Quiz {
  id: number
  lessonId: number
  timeLimit: number | null
  passScore: number | null
  createdAt: string
}

export interface QuestionOption {
  id: number
  content: string
  isCorrect: boolean
}

export interface Question {
  id: number
  quizId: number
  content: string
  score: number
  orderIndex: number
  options: QuestionOption[]
}

export interface CreateQuizPayload {
  timeLimit?: number
  passScore: number
}

export interface UpdateQuizPayload extends CreateQuizPayload {}

export interface ImportQuizDocumentPayload {
  file: File
  timeLimit?: number
  passScore: number
}

export interface CreateQuestionOptionPayload {
  content: string
  isCorrect: boolean
}

export interface CreateQuestionPayload {
  content: string
  score: number
  orderIndex: number
  options: CreateQuestionOptionPayload[]
}

export interface UpdateQuestionPayload extends CreateQuestionPayload {}
