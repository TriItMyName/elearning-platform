import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type {
  AdminCategory,
  AdminPermission,
  AdminRole,
  AdminUser,
  AssignPermissionsPayload,
  AssignRolesPayload,
  CreateCategoryPayload,
  CreatePermissionPayload,
  CreateRolePayload,
  CreateUserPayload,
  UpdateCategoryPayload,
  UpdatePermissionPayload,
  UpdateRolePayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UsersQueryParams,
} from '@/types/admin'
import type {
  AdminCourse,
  AdminChapter,
  AdminLesson,
  CreateAdminChapterPayload,
  CreateAdminCoursePayload,
  CreateAdminLessonPayload,
  UpdateAdminChapterPayload,
  UpdateAdminCoursePayload,
  UpdateAdminLessonPayload,
} from '@/types/admin-course'
import type { AdminStudentLearning, AdminStudentOverview } from '@/types/admin-student'

export interface AdminPageParams {
  page?: number
  size?: number
  sort?: string[]
}

export const adminApi = {
  users: {
    list(params: UsersQueryParams = {}) {
      return apiClient.get<PageResponse<AdminUser>>('/admin/users', { params }).then((r) => r.data)
    },
    getById(id: number) {
      return apiClient.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data)
    },
    create(payload: CreateUserPayload) {
      return apiClient.post<AdminUser>('/admin/users', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateUserPayload) {
      return apiClient.put<AdminUser>(`/admin/users/${id}`, payload).then((r) => r.data)
    },
    updateStatus(id: number, payload: UpdateUserStatusPayload) {
      return apiClient.put<AdminUser>(`/admin/users/${id}/status`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/users/${id}`)
    },
  },

  students: {
    list(params: AdminPageParams & { keyword?: string } = { page: 0, size: 10 }) {
      return apiClient
        .get<PageResponse<AdminStudentOverview>>('/admin/students', { params })
        .then((r) => r.data)
    },
    learning(id: number) {
      return apiClient.get<AdminStudentLearning>(`/admin/students/${id}/learning`).then((r) => r.data)
    },
  },

  roles: {
    list() {
      return apiClient.get<AdminRole[]>('/admin/roles').then((r) => r.data)
    },
    create(payload: CreateRolePayload) {
      return apiClient.post<AdminRole>('/admin/roles', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateRolePayload) {
      return apiClient.put<AdminRole>(`/admin/roles/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/roles/${id}`)
    },
    assignPermissions(id: number, payload: AssignPermissionsPayload) {
      return apiClient.post(`/admin/roles/${id}/permissions`, payload)
    },
    assignToUser(userId: number, payload: AssignRolesPayload) {
      return apiClient.post(`/admin/roles/users/${userId}`, payload)
    },
  },

  permissions: {
    list() {
      return apiClient.get<AdminPermission[]>('/admin/permissions').then((r) => r.data)
    },
    create(payload: CreatePermissionPayload) {
      return apiClient.post<AdminPermission>('/admin/permissions', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdatePermissionPayload) {
      return apiClient.put<AdminPermission>(`/admin/permissions/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/permissions/${id}`)
    },
  },

  categories: {
    list(params: { page?: number; size?: number } = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminCategory>>('/admin/categories', { params })
        .then((r) => r.data)
    },
    getById(id: number) {
      return apiClient.get<AdminCategory>(`/admin/categories/${id}`).then((r) => r.data)
    },
    create(payload: CreateCategoryPayload) {
      return apiClient.post<AdminCategory>('/admin/categories', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateCategoryPayload) {
      return apiClient.put<AdminCategory>(`/admin/categories/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/categories/${id}`)
    },
  },

  courses: {
    list(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminCourse>>('/admin/courses', { params })
        .then((r) => r.data)
    },
    listDeleted(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminCourse>>('/admin/courses/deleted', { params })
        .then((r) => r.data)
    },
    getById(id: number) {
      return apiClient.get<AdminCourse>(`/admin/courses/${id}`).then((r) => r.data)
    },
    create(payload: CreateAdminCoursePayload) {
      return apiClient.post<AdminCourse>('/admin/courses', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateAdminCoursePayload) {
      return apiClient.put<AdminCourse>(`/admin/courses/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/courses/${id}`)
    },
    restore(id: number) {
      return apiClient.put<AdminCourse>(`/admin/courses/${id}/restore`).then((r) => r.data)
    },
    listPending(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminCourse>>('/admin/courses/pending', { params })
        .then((r) => r.data)
    },
    listRejected(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminCourse>>('/admin/courses/rejected', { params })
        .then((r) => r.data)
    },
    approve(id: number) {
      return apiClient.put<AdminCourse>(`/admin/courses/${id}/approve`).then((r) => r.data)
    },
    reject(id: number) {
      return apiClient.put<AdminCourse>(`/admin/courses/${id}/reject`).then((r) => r.data)
    },
  },

  chapters: {
    list(params: AdminPageParams & { courseId?: number } = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminChapter>>('/admin/chapters', { params })
        .then((r) => r.data)
    },
    listDeleted(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminChapter>>('/admin/chapters/deleted', { params })
        .then((r) => r.data)
    },
    getById(id: number) {
      return apiClient.get<AdminChapter>(`/admin/chapters/${id}`).then((r) => r.data)
    },
    create(payload: CreateAdminChapterPayload) {
      return apiClient.post<AdminChapter>('/admin/chapters', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateAdminChapterPayload) {
      return apiClient.put<AdminChapter>(`/admin/chapters/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/chapters/${id}`)
    },
    restore(id: number) {
      return apiClient.put<AdminChapter>(`/admin/chapters/${id}/restore`).then((r) => r.data)
    },
  },

  lessons: {
    list(params: AdminPageParams & { chapterId?: number } = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminLesson>>('/admin/lessons', { params })
        .then((r) => r.data)
    },
    listDeleted(params: AdminPageParams = { page: 0, size: 200 }) {
      return apiClient
        .get<PageResponse<AdminLesson>>('/admin/lessons/deleted', { params })
        .then((r) => r.data)
    },
    getById(id: number) {
      return apiClient.get<AdminLesson>(`/admin/lessons/${id}`).then((r) => r.data)
    },
    create(payload: CreateAdminLessonPayload) {
      return apiClient.post<AdminLesson>('/admin/lessons', payload).then((r) => r.data)
    },
    update(id: number, payload: UpdateAdminLessonPayload) {
      return apiClient.put<AdminLesson>(`/admin/lessons/${id}`, payload).then((r) => r.data)
    },
    delete(id: number) {
      return apiClient.delete(`/admin/lessons/${id}`)
    },
    restore(id: number) {
      return apiClient.put<AdminLesson>(`/admin/lessons/${id}/restore`).then((r) => r.data)
    },
    uploadVideo(id: number, file: File, options?: { signal?: AbortSignal }) {
      const form = new FormData()
      form.append('file', file)
      return apiClient
        .post<AdminLesson>(`/admin/lessons/${id}/upload-video`, form, { signal: options?.signal })
        .then((r) => r.data)
    },
    uploadDocument(id: number, file: File) {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post<AdminLesson>(`/admin/lessons/${id}/upload-document`, form).then((r) => r.data)
    },
  },
}
