import axios from 'axios'

import { handleSessionExpired } from '@/auth/session'
import { tokenService } from '@/auth/token.service'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

type QueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let pendingQueue: QueueItem[] = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  pendingQueue = []
}

export function isAuthEndpoint(url = ''): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  )
}

interface RefreshOptions {
  /** Show session-expired toast and redirect. Default true for API retries. */
  notifyOnFailure?: boolean
}

export async function refreshAccessToken(
  options: RefreshOptions = {},
): Promise<string | null> {
  const { notifyOnFailure = true } = options
  const refreshToken = tokenService.getRefreshToken()

  if (!refreshToken) {
    return null
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const tokenSnapshot = refreshToken
  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<{
        accessToken: string
        refreshToken: string
      }>(`${API_BASE_URL}/auth/refresh`, { refreshToken: tokenSnapshot })

      if (tokenService.getRefreshToken() !== tokenSnapshot) {
        return tokenService.getAccessToken()
      }

      tokenService.updateTokens(data.accessToken, data.refreshToken)
      processQueue(null, data.accessToken)
      return data.accessToken
    } catch (error) {
      processQueue(error, null)

      if (tokenService.getRefreshToken() !== tokenSnapshot) {
        return tokenService.getAccessToken()
      }

      if (notifyOnFailure) {
        handleSessionExpired()
      } else {
        tokenService.clearAuth()
      }
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function ensureValidAccessToken(): Promise<string | null> {
  const accessToken = tokenService.getAccessToken()
  if (accessToken && !tokenService.shouldRefreshAccessToken()) {
    return accessToken
  }

  if (!tokenService.getRefreshToken()) {
    return accessToken
  }

  return refreshAccessToken()
}

export function shouldRetryWithRefresh(status?: number, url = ''): boolean {
  if (!status || isAuthEndpoint(url)) return false
  return status === 401 || status === 403
}
