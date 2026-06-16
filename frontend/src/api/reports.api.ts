import { apiClient } from '@/api/client'
import { isMockEnabled } from '@/lib/mock-mode'
import { reportsMockApi } from '@/mocks/reports.mock'
import type { AdminReportsSummary } from '@/types/reports'

const liveApi = {
  getSummary() {
    return apiClient.get<AdminReportsSummary>('/admin/reports/summary').then((r) => r.data)
  },
}

export const reportsApi = {
  getSummary() {
    if (isMockEnabled('reports')) return reportsMockApi.getSummary()
    return liveApi.getSummary()
  },
}
