import { apiClient } from '@/api/client'
import type { StudentProgressOverview } from '@/types/student-progress'

export const studentProgressApi = {
  overview() {
    return apiClient
      .get<StudentProgressOverview>('/courses/progress/student/overview')
      .then((response) => response.data)
  },
}
