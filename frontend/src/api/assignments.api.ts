import { apiClient } from '@/api/client'
import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment'

function basePath(courseId: number, chapterId: number, lessonId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignments/teacher`
}

export const assignmentsApi = {
  listByLesson(courseId: number, chapterId: number, lessonId: number) {
    return apiClient.get<Assignment[]>(basePath(courseId, chapterId, lessonId)).then((r) => r.data)
  },

  create(courseId: number, chapterId: number, lessonId: number, payload: CreateAssignmentPayload) {
    return apiClient.post<Assignment>(basePath(courseId, chapterId, lessonId), payload).then((r) => r.data)
  },

  update(
    courseId: number,
    chapterId: number,
    lessonId: number,
    assignmentId: number,
    payload: UpdateAssignmentPayload,
  ) {
    return apiClient
      .put<Assignment>(`${basePath(courseId, chapterId, lessonId)}/${assignmentId}`, payload)
      .then((r) => r.data)
  },

  delete(courseId: number, chapterId: number, lessonId: number, assignmentId: number) {
    return apiClient.delete(`${basePath(courseId, chapterId, lessonId)}/${assignmentId}`)
  },
}
