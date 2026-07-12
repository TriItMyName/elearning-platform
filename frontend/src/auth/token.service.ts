import type { AuthTokens, AuthUser } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'wl_access_token'
const REFRESH_TOKEN_KEY = 'wl_refresh_token'
const USER_KEY = 'wl_user'
const EXPIRES_AT_KEY = 'wl_token_expires_at'

function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized)) as { exp?: number }
    return decoded.exp ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token: string | null, bufferMs = 30_000): boolean {
  if (!token) return true
  const exp = decodeJwtExp(token)
  if (!exp) return false
  return Date.now() >= exp - bufferMs
}

export const tokenService = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getExpiresAt(): number | null {
    const raw = localStorage.getItem(EXPIRES_AT_KEY)
    return raw ? Number(raw) : null
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)

    const expiresAt =
      (tokens.expiresIn ? Date.now() + tokens.expiresIn : null) ??
      decodeJwtExp(tokens.accessToken)

    if (expiresAt) {
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
    }
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  setAuth(tokens: AuthTokens, user: AuthUser): void {
    this.setTokens(tokens)
    this.setUser(user)
  },

  updateTokens(accessToken: string, refreshToken: string, expiresInMs?: number): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

    const expiresAt =
      (expiresInMs ? Date.now() + expiresInMs : null) ?? decodeJwtExp(accessToken)

    if (expiresAt) {
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
    }
  },

  shouldRefreshAccessToken(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false
    if (!accessToken) return true
    if (isAccessTokenExpired(accessToken)) return true

    const expiresAt = this.getExpiresAt()
    return Boolean(expiresAt && Date.now() >= expiresAt - 30_000)
  },

  clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
  },

  isAuthenticated(): boolean {
    return Boolean(this.getRefreshToken())
  },
}
