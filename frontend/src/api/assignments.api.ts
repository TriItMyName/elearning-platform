import { apiClient } from '@/api/client'
import { isMockEnabled } from '@/lib/mock-mode'
import { assignmentsMockApi } from '@/mocks/assignments.mock'
import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from '@/types/assignment'

function basePath(courseId: number, chapterId: number, lessonId: number) {
  return `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/assignments/teacher`
}

const liveApi = {
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

export const assignmentsApi = {
  listByLesson(courseId: number, chapterId: number, lessonId: number) {
    if (isMockEnabled('assignments')) {
      return Promise.resolve(assignmentsMockApi.listByLesson(courseId, chapterId, lessonId))
    }
    return liveApi.listByLesson(courseId, chapterId, lessonId)
  },

  create(courseId: number, chapterId: number, lessonId: number, payload: CreateAssignmentPayload) {
    if (isMockEnabled('assignments')) {
      return Promise.resolve(assignmentsMockApi.create(courseId, chapterId, lessonId, payload))
    }
    return liveApi.create(courseId, chapterId, lessonId, payload)
  },

  update(
    courseId: number,
    chapterId: number,
    lessonId: number,
    assignmentId: number,
    payload: UpdateAssignmentPayload,
  ) {
    if (isMockEnabled('assignments')) {
      return Promise.resolve(
        assignmentsMockApi.update(courseId, chapterId, lessonId, assignmentId, payload),
      )
    }
    return liveApi.update(courseId, chapterId, lessonId, assignmentId, payload)
  },

  delete(courseId: number, chapterId: number, lessonId: number, assignmentId: number): Promise<void> {
    if (isMockEnabled('assignments')) {
      assignmentsMockApi.delete(courseId, chapterId, lessonId, assignmentId)
      return Promise.resolve()
    }
    return liveApi.delete(courseId, chapterId, lessonId, assignmentId).then(() => undefined)
  },
}
