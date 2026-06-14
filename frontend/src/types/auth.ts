export type UserRole = 'student' | 'teacher' | 'admin'

export interface AuthUser {
  id: number
  username: string
  email: string
  fullName: string
  active: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  tokenType?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  fullName: string
  role?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ProfileResponse {
  id: number
  username: string
  fullName: string
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}
