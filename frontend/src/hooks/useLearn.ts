import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { learnApi } from '@/api/learn.api'
import type { MarkLessonCompletePayload } from '@/types/learn'

export function useLearnCourse(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['learn', slug],
    queryFn: () => learnApi.getCourseBySlug(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
  })
}

export function useMarkLessonComplete(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MarkLessonCompletePayload) => learnApi.markLessonComplete(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learn', slug] })
    },
  })
}
