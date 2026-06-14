import { useQuery } from '@tanstack/react-query'

import { adminApi } from '@/api/admin.api'
import { useAuth } from '@/auth/auth.context'

export function useAdminAccess() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['admin', 'access'],
    queryFn: () => adminApi.roles.list(),
    enabled: isAuthenticated && !authLoading,
    retry: false,
    staleTime: 5 * 60_000,
  })

  return {
    isAdmin: Boolean(query.isSuccess),
    isChecking: (isAuthenticated && authLoading) || (isAuthenticated && query.isLoading),
    isForbidden: query.isError && !authLoading,
    ...query,
  }
}
