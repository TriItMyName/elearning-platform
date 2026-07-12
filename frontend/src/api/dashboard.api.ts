import { apiClient } from '@/api/client'
import type { AdminDashboardSummary } from '@/types/dashboard'

export const dashboardApi = {
  getSummary() {
    return apiClient.get<AdminDashboardSummary>('/admin/dashboard/summary').then((r) => r.data)
  },
}
