import { useAuth } from '@/auth/auth.context'

export function useAdminAccess() {
  const { isAuthenticated, isLoading: authLoading, canAccessAdmin } = useAuth()

  return {
    isAdmin: canAccessAdmin,
    isChecking: isAuthenticated && authLoading,
    isForbidden: isAuthenticated && !authLoading && !canAccessAdmin,
  }
}
