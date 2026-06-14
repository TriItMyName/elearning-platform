import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category'

export interface CategoriesQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

export const categoriesApi = {
  list(params: CategoriesQueryParams = {}) {
    return apiClient.get<PageResponse<Category>>('/categories', { params }).then((r) => r.data)
  },

  getById(id: number) {
    return apiClient.get<Category>(`/categories/${id}`).then((r) => r.data)
  },

  getByName(name: string) {
    return apiClient.get<Category>(`/categories/name/${encodeURIComponent(name)}`).then((r) => r.data)
  },

  create(payload: CreateCategoryPayload) {
    return apiClient.post<Category>('/categories', payload).then((r) => r.data)
  },

  update(id: number, payload: UpdateCategoryPayload) {
    return apiClient.put<Category>(`/categories/${id}`, payload).then((r) => r.data)
  },

  delete(id: number) {
    return apiClient.delete(`/categories/${id}`)
  },
}
