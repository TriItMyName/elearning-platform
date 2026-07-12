import { useQuery } from '@tanstack/react-query'

import { dashboardApi } from '@/api/dashboard.api'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 60_000,
  })
}
