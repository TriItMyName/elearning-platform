import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import {
  ensureValidAccessToken,
  isAuthEndpoint,
  refreshAccessToken,
  shouldRetryWithRefresh,
} from '@/auth/token.refresh'
import { tokenService } from '@/auth/token.service'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const url = config.url ?? ''

  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  if (isAuthEndpoint(url)) {
    if (url.includes('/auth/logout')) {
      const token = tokenService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  }

  const token = await ensureValidAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const url = originalRequest?.url ?? ''
    const status = error.response?.status

    if (
      !originalRequest ||
      originalRequest._retry ||
      !shouldRetryWithRefresh(status, url) ||
      !tokenService.getRefreshToken()
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const newToken = await refreshAccessToken({ notifyOnFailure: true })
    if (!newToken) {
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return apiClient(originalRequest)
  },
)
