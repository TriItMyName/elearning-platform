import { useQuery } from '@tanstack/react-query'

import { authApi } from '@/api/auth.api'

export const currentUserQueryKey = ['auth', 'me'] as const

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => authApi.getMe(),
    enabled,
    staleTime: 60_000,
  })
}
