import { useQuery } from '@tanstack/react-query'

import { reportsApi } from '@/api/reports.api'

export function useReportsSummary() {
  return useQuery({
    queryKey: ['admin', 'reports', 'summary'],
    queryFn: () => reportsApi.getSummary(),
    staleTime: 60_000,
  })
}
