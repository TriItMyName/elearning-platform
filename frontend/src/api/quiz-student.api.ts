import { apiClient } from '@/api/client'
import type {
  QuizAttempt,
  StudentQuestion,
  StudentQuiz,
  SubmitQuizPayload,
  SubmitQuizResult,
} from '@/types/quiz-student'

function basePath(courseId: number, chapterId: number, lessonId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/quizzes/student`
}

const liveApi = {
  async getByLesson(courseId: number, chapterId: number, lessonId: number) {
    const path = basePath(courseId, chapterId, lessonId)
    const { data: quizzes } = await apiClient.get<Omit<StudentQuiz, 'questions'>[]>(path)
    const quiz = quizzes[0]
    if (!quiz) return null
    const { data: questions } = await apiClient.get<StudentQuestion[]>(
      `${path}/${quiz.id}/questions`,
    )
    return { ...quiz, questions } satisfies StudentQuiz
  },

  submit(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    payload: SubmitQuizPayload,
  ) {
    return apiClient
      .post<SubmitQuizResult>(
        `${basePath(courseId, chapterId, lessonId)}/${quizId}/submit`,
        payload,
      )
      .then((r) => r.data)
  },

  listAttempts(courseId: number, chapterId: number, lessonId: number) {
    return apiClient
      .get<QuizAttempt[]>(`${basePath(courseId, chapterId, lessonId)}/attempts`)
      .then((response) => response.data)
  },

  listAttemptsByQuiz(courseId: number, chapterId: number, lessonId: number, quizId: number) {
    return apiClient
      .get<QuizAttempt[]>(`${basePath(courseId, chapterId, lessonId)}/${quizId}/attempts`)
      .then((response) => response.data)
  },
}

export const quizStudentApi = {
  getByLesson(courseId: number, chapterId: number, lessonId: number) {
    return liveApi.getByLesson(courseId, chapterId, lessonId)
  },

  submit(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    payload: SubmitQuizPayload,
  ) {
    return liveApi.submit(courseId, chapterId, lessonId, quizId, payload)
  },

  listAttempts: liveApi.listAttempts,
  listAttemptsByQuiz: liveApi.listAttemptsByQuiz,
}
