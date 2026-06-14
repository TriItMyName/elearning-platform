import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/auth/auth.context'
import { queryClient } from '@/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
