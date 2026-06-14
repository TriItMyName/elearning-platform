import { apiClient } from '@/api/client'
import { tokenService } from '@/auth/token.service'
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  ProfileResponse,
  RegisterPayload,
} from '@/types/auth'

function toAuthUser(profile: ProfileResponse): AuthUser {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName,
    active: profile.active,
  }
}

async function fetchProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ProfileResponse>('/profile')
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

    const user = await fetchProfile()
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

  async getProfile(): Promise<AuthUser> {
    return fetchProfile()
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
