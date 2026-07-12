import { useAuth } from '@/auth/auth.context'

export function useAdminAccess() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    canAccessAdmin,
    canAccessTeacher,
  } = useAuth()

  return {
    isAdmin: canAccessAdmin,
    isTeacher: canAccessTeacher && !canAccessAdmin,
    isChecking: isAuthenticated && authLoading,
    isForbidden: isAuthenticated && !authLoading && !canAccessAdmin,
  }
}
