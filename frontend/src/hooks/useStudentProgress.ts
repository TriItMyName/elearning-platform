import { useQuery } from '@tanstack/react-query'

import { studentProgressApi } from '@/api/student-progress.api'

export function useStudentProgressOverview(enabled = true) {
  return useQuery({
    queryKey: ['student', 'progress', 'overview'],
    queryFn: () => studentProgressApi.overview(),
    enabled,
    staleTime: 60_000,
  })
}
