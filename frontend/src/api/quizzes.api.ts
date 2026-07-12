import { apiClient } from '@/api/client'
import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  ImportQuizDocumentPayload,
  Question,
  Quiz,
  UpdateQuestionPayload,
  UpdateQuizPayload,
} from '@/types/quiz'

function basePath(courseId: number, chapterId: number, lessonId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/quizzes/teacher`
}

export const quizzesApi = {
  listByLesson(courseId: number, chapterId: number, lessonId: number) {
    return apiClient.get<Quiz[]>(basePath(courseId, chapterId, lessonId)).then((r) => r.data)
  },

  create(courseId: number, chapterId: number, lessonId: number, payload: CreateQuizPayload) {
    return apiClient.post<Quiz>(basePath(courseId, chapterId, lessonId), payload).then((r) => r.data)
  },

  importDocument(
    courseId: number,
    chapterId: number,
    lessonId: number,
    payload: ImportQuizDocumentPayload,
  ) {
    const form = new FormData()
    form.append('file', payload.file)
    if (payload.timeLimit != null) form.append('timeLimit', String(payload.timeLimit))
    form.append('passScore', String(payload.passScore))
    return apiClient
      .post<Quiz>(`${basePath(courseId, chapterId, lessonId)}/import-document`, form)
      .then((r) => r.data)
  },

  update(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    payload: UpdateQuizPayload,
  ) {
    return apiClient
      .put<Quiz>(`${basePath(courseId, chapterId, lessonId)}/${quizId}`, payload)
      .then((r) => r.data)
  },

  delete(courseId: number, chapterId: number, lessonId: number, quizId: number) {
    return apiClient.delete(`${basePath(courseId, chapterId, lessonId)}/${quizId}`)
  },

  listQuestions(courseId: number, chapterId: number, lessonId: number, quizId: number) {
    return apiClient
      .get<Question[]>(`${basePath(courseId, chapterId, lessonId)}/${quizId}/questions`)
      .then((r) => r.data)
  },

  createQuestion(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    payload: CreateQuestionPayload,
  ) {
    return apiClient
      .post<Question>(`${basePath(courseId, chapterId, lessonId)}/${quizId}/questions`, payload)
      .then((r) => r.data)
  },

  updateQuestion(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    questionId: number,
    payload: UpdateQuestionPayload,
  ) {
    return apiClient
      .put<Question>(
        `${basePath(courseId, chapterId, lessonId)}/${quizId}/questions/${questionId}`,
        payload,
      )
      .then((r) => r.data)
  },

  deleteQuestion(
    courseId: number,
    chapterId: number,
    lessonId: number,
    quizId: number,
    questionId: number,
  ) {
    return apiClient.delete(
      `${basePath(courseId, chapterId, lessonId)}/${quizId}/questions/${questionId}`,
    )
  },
}
