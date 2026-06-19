import { AxiosError } from 'axios'

import type { ApiErrorBody } from '@/types/api'

function firstValidationMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined

  const record = data as Record<string, unknown>
  if (typeof record.message === 'string') return record.message

  if (record.errors && typeof record.errors === 'object') {
    const first = Object.values(record.errors as Record<string, unknown>)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
    if (typeof first === 'string') return first
  }

  const firstFieldError = Object.values(record).find((value) => typeof value === 'string')
  if (typeof firstFieldError === 'string' && !firstFieldError.startsWith('Đã xảy ra lỗi')) {
    return firstFieldError
  }

  return undefined
}

export function getErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi'): string {
  if (error instanceof AxiosError) {
    const validationMessage = firstValidationMessage(error.response?.data)
    if (validationMessage) return validationMessage

    const body = error.response?.data as ApiErrorBody | undefined
    if (body?.message) return body.message

    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401
}

export function isAccessDeniedError(error: unknown): boolean {
  return (
    error instanceof AxiosError &&
    (error.response?.status === 401 || error.response?.status === 403)
  )
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof AxiosError && error.code === 'ERR_CANCELED') return true
  if (error instanceof DOMException && error.name === 'AbortError') return true
  return false
}
