import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type {
  Chapter,
  CreateChapterPayload,
  ReorderChaptersPayload,
  UpdateChapterPayload,
} from '@/types/chapter'

export interface ChaptersQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

export const chaptersApi = {
  listByCourse(courseId: number, params: ChaptersQueryParams = {}) {
    return apiClient
      .get<PageResponse<Chapter>>(`/courses/${courseId}/chapters`, { params })
      .then((r) => r.data)
  },

  createByTeacher(courseId: number, payload: CreateChapterPayload) {
    return apiClient
      .post<Chapter>(`/courses/${courseId}/chapters/teacher`, payload)
      .then((r) => r.data)
  },

  updateByTeacher(courseId: number, chapterId: number, payload: UpdateChapterPayload) {
    return apiClient
      .put<Chapter>(`/courses/${courseId}/chapters/teacher/${chapterId}`, payload)
      .then((r) => r.data)
  },

  deleteByTeacher(courseId: number, chapterId: number) {
    return apiClient.delete(`/courses/${courseId}/chapters/teacher/${chapterId}`)
  },

  reorderByTeacher(courseId: number, payload: ReorderChaptersPayload) {
    return apiClient
      .patch<Chapter[]>(`/courses/${courseId}/chapters/teacher/reorder`, payload)
      .then((r) => r.data)
  },
}
