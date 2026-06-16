import { apiClient } from '@/api/client'
import { isMockEnabled } from '@/lib/mock-mode'
import { quizStudentMockApi } from '@/mocks/quiz-student.mock'
import type { StudentQuiz, SubmitQuizPayload, SubmitQuizResult } from '@/types/quiz-student'

const liveApi = {
  getByLesson(courseId: number, chapterId: number, lessonId: number) {
    return apiClient
      .get<StudentQuiz>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/quizzes/student`,
      )
      .then((r) => r.data)
  },

  submit(courseId: number, chapterId: number, lessonId: number, payload: SubmitQuizPayload) {
    return apiClient
      .post<SubmitQuizResult>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/quizzes/student/submit`,
        payload,
      )
      .then((r) => r.data)
  },
}

export const quizStudentApi = {
  getByLesson(courseId: number, chapterId: number, lessonId: number) {
    if (isMockEnabled('quizStudent')) {
      return quizStudentMockApi.getByLesson(lessonId)
    }
    return liveApi.getByLesson(courseId, chapterId, lessonId)
  },

  submit(
    courseId: number,
    chapterId: number,
    lessonId: number,
    payload: SubmitQuizPayload,
  ) {
    if (isMockEnabled('quizStudent')) return quizStudentMockApi.submit(payload)
    return liveApi.submit(courseId, chapterId, lessonId, payload)
  },
}
