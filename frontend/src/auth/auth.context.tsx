import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authApi } from '@/api/auth.api'
import { refreshAccessToken } from '@/auth/token.refresh'
import { SESSION_EXPIRED_EVENT, resetSessionExpiredFlag } from '@/auth/session'
import { tokenService } from '@/auth/token.service'
import { currentUserQueryKey } from '@/hooks/useAuthMe'
import {
  canAccessAdminPanel,
  canAccessTeacherPanel,
  getManagementPath,
} from '@/lib/auth-roles'
import { notify } from '@/lib/notify'
import { queryClient } from '@/lib/query-client'
import type { AuthUser, LoginCredentials, RegisterPayload, UserRole } from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  canAccessAdmin: boolean
  canAccessTeacher: boolean
  managementPath: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  syncUser: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenService.getUser())
  const [isLoading, setIsLoading] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(() =>
    Boolean(tokenService.getRefreshToken()),
  )

  useEffect(() => {
    const onSessionExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
  }, [])

  useEffect(() => {
    if (!tokenService.getRefreshToken()) {
      setIsBootstrapping(false)
      return
    }

    const bootstrap = async () => {
      try {
        if (tokenService.shouldRefreshAccessToken()) {
          const token = await refreshAccessToken({ notifyOnFailure: false })
          if (!token) {
            setUser(null)
            return
          }
        }

        const me = await queryClient.fetchQuery({
          queryKey: currentUserQueryKey,
          queryFn: () => authApi.getMe(),
          staleTime: 60_000,
        })
        setUser(me)
        tokenService.setUser(me)
      } catch {
        setUser(null)
      } finally {
        setIsBootstrapping(false)
      }
    }

    void bootstrap()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      resetSessionExpiredFlag()
      tokenService.clearAuth()
      setUser(null)
      queryClient.removeQueries({ queryKey: currentUserQueryKey })

      const response = await authApi.login(credentials)
      setUser(response.user)
      queryClient.setQueryData(currentUserQueryKey, response.user)
      notify.success('Đăng nhập thành công')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true)
    try {
      await authApi.register(payload)
      notify.success('Đăng ký thành công')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
      setUser(null)
      queryClient.removeQueries({ queryKey: currentUserQueryKey })
      notify.info('Đã đăng xuất')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const syncUser = useCallback(() => {
    setUser(tokenService.getUser())
  }, [])

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user?.roles?.length) return false
      const allowed = (Array.isArray(roles) ? roles : [roles]).map((r) => r.toLowerCase())
      const userRoles = user.roles.map((r) => r.toLowerCase())
      return allowed.some((role) => userRoles.includes(role))
    },
    [user],
  )

  const canAccessAdmin = canAccessAdminPanel(user?.roles)
  const canAccessTeacher = canAccessTeacherPanel(user?.roles)
  const managementPath = getManagementPath(user?.roles)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenService.getRefreshToken()),
      isLoading: isLoading || isBootstrapping,
      canAccessAdmin,
      canAccessTeacher,
      managementPath,
      login,
      register,
      logout,
      syncUser,
      hasRole,
    }),
    [
      user,
      isLoading,
      isBootstrapping,
      canAccessAdmin,
      canAccessTeacher,
      managementPath,
      login,
      register,
      logout,
      syncUser,
      hasRole,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
