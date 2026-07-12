import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type {
  CreateLessonPayload,
  Lesson,
  ReorderLessonsPayload,
  UpdateLessonPayload,
} from '@/types/lesson'

export interface LessonsQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

function basePath(courseId: number, chapterId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/teacher`
}

export const lessonsApi = {
  listByChapter(courseId: number, chapterId: number, params: LessonsQueryParams = {}) {
    return apiClient
      .get<PageResponse<Lesson>>(basePath(courseId, chapterId), { params })
      .then((r) => r.data)
  },

  create(courseId: number, chapterId: number, payload: CreateLessonPayload) {
    return apiClient.post<Lesson>(basePath(courseId, chapterId), payload).then((r) => r.data)
  },

  update(courseId: number, chapterId: number, lessonId: number, payload: UpdateLessonPayload) {
    return apiClient
      .put<Lesson>(`${basePath(courseId, chapterId)}/${lessonId}`, payload)
      .then((r) => r.data)
  },

  delete(courseId: number, chapterId: number, lessonId: number) {
    return apiClient.delete(`${basePath(courseId, chapterId)}/${lessonId}`)
  },

  reorder(courseId: number, chapterId: number, payload: ReorderLessonsPayload) {
    return apiClient
      .patch<Lesson[]>(`${basePath(courseId, chapterId)}/reorder`, payload)
      .then((r) => r.data)
  },

  uploadVideo(courseId: number, chapterId: number, lessonId: number, file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<Lesson>(`${basePath(courseId, chapterId)}/${lessonId}/upload-video`, form)
      .then((r) => r.data)
  },

  listForStudent(courseId: number, chapterId: number, params: LessonsQueryParams = {}) {
    return apiClient
      .get<PageResponse<Lesson>>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/student`,
        { params },
      )
      .then((response) => response.data)
  },

  getForStudent(courseId: number, chapterId: number, lessonId: number) {
    return apiClient
      .get<Lesson>(`/courses/${courseId}/chapters/${chapterId}/lessons/student/${lessonId}`)
      .then((response) => response.data)
  },

  getVideoStream(courseId: number, chapterId: number, lessonId: number) {
    return apiClient
      .get<Blob>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/student/${lessonId}/video-stream`,
        { responseType: 'blob' },
      )
      .then((response) => response.data)
  },

}
