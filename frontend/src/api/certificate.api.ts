import { apiClient } from '@/api/client'
import type { Certificate } from '@/types/certificate'

export const certificateApi = {
  list() {
    return apiClient.get<Certificate[]>('/certificates/student').then((response) => response.data)
  },

  getByCourse(courseId: number) {
    return apiClient
      .get<Certificate>(`/certificates/student/courses/${courseId}`)
      .then((response) => response.data)
  },

  generate(courseId: number) {
    return apiClient
      .post<Certificate>(`/certificates/student/courses/${courseId}/generate`)
      .then((response) => response.data)
  },

  downloadPdf(courseId: number) {
    return apiClient
      .get<Blob>(`/certificates/student/courses/${courseId}/pdf`, {
        responseType: 'blob',
      })
      .then((response) => response.data)
  },
}
