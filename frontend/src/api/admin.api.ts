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
    list() {
      return apiClient.get<AdminCategory[]>('/admin/categories').then((r) => r.data)
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
}
