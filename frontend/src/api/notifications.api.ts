import { apiClient } from '@/api/client'
import type { StudentNotification } from '@/types/notification'

export const notificationsApi = {
  listMine() {
    return apiClient
      .get<StudentNotification[]>('/notifications/student')
      .then((response) => response.data)
  },

  listByCourse(courseId: number) {
    return apiClient
      .get<StudentNotification[]>(`/notifications/student/courses/${courseId}`)
      .then((response) => response.data)
  },

  markAsRead(notificationId: number) {
    return apiClient
      .patch<StudentNotification>(`/notifications/student/${notificationId}/read`)
      .then((response) => response.data)
  },
}
