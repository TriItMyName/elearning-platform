import { QueryCache, QueryClient } from '@tanstack/react-query'

import { getErrorMessage, isAccessDeniedError } from '@/lib/errors'
import { notify } from '@/lib/notify'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isAccessDeniedError(error)) return
      notify.error(getErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAccessDeniedError(error)) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      onError: (error) => {
        if (isAccessDeniedError(error)) return
        notify.error(getErrorMessage(error))
      },
    },
  },
})
