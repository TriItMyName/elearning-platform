import { apiClient } from '@/api/client'
import { tokenService } from '@/auth/token.service'
import type {
  AuthTokens,
  AuthUser,
  CurrentUserResponse,
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
} from '@/types/auth'

function toAuthUser(me: CurrentUserResponse): AuthUser {
  return {
    id: me.id,
    username: me.username,
    email: me.email,
    fullName: me.fullName,
    roles: me.roles,
    permissions: me.permissions,
  }
}

async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<CurrentUserResponse>('/auth/me')
  return toAuthUser(data)
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      tokenType: data.tokenType,
    }
    tokenService.setTokens(tokens)

    const user = await fetchMe()
    tokenService.setUser(user)
    return { user, tokens }
  },

  async register(payload: RegisterPayload): Promise<string> {
    const { data } = await apiClient.post<string>('/auth/register', payload)
    return data
  },

  async logout(): Promise<void> {
    const refreshToken = tokenService.getRefreshToken()
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken })
      } catch {
        // Clear local session even if server logout fails
      }
    }
    tokenService.clearAuth()
  },

  async getMe(): Promise<AuthUser> {
    return fetchMe()
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    )
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
    tokenService.updateTokens(tokens.accessToken, tokens.refreshToken)
    return tokens
  },
}
