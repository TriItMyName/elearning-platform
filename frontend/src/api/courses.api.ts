import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type {
  Course,
  CreateCoursePayload,
  CreateTeacherCoursePayload,
  UpdateCoursePayload,
  UpdateTeacherCoursePayload,
} from '@/types/course'

export interface CoursesQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

export const coursesApi = {
  list(params: CoursesQueryParams = {}) {
    return apiClient.get<PageResponse<Course>>('/courses', { params }).then((r) => r.data)
  },

  getById(id: number) {
    return apiClient.get<Course>(`/courses/${id}`).then((r) => r.data)
  },

  myCourses(params: CoursesQueryParams = {}) {
    return apiClient.get<PageResponse<Course>>('/courses/my-courses', { params }).then((r) => r.data)
  },

  create(payload: CreateCoursePayload) {
    return apiClient.post<Course>('/courses', payload).then((r) => r.data)
  },

  update(id: number, payload: UpdateCoursePayload) {
    return apiClient.put<Course>(`/courses/${id}`, payload).then((r) => r.data)
  },

  delete(id: number) {
    return apiClient.delete(`/courses/${id}`)
  },

  createByTeacher(payload: CreateTeacherCoursePayload) {
    return apiClient.post<Course>('/courses/teacher', payload).then((r) => r.data)
  },

  updateByTeacher(id: number, payload: UpdateTeacherCoursePayload) {
    return apiClient.put<Course>(`/courses/teacher/${id}`, payload).then((r) => r.data)
  },

  deleteByTeacher(id: number) {
    return apiClient.delete(`/courses/teacher/${id}`)
  },
}
