import { apiClient } from '@/api/client'
import { isMockEnabled } from '@/lib/mock-mode'
import {
  enrollCourse as enrollLocal,
  getEnrolledCourseIds as getEnrolledLocal,
  isEnrolled as isEnrolledLocal,
} from '@/lib/enrollment.storage'
import { tokenService } from '@/auth/token.service'

const liveApi = {
  listMine() {
    return apiClient.get<number[]>('/courses/enrolled').then((r) => r.data)
  },

  enroll(courseId: number) {
    return apiClient.post<{ courseId: number }>(`/courses/${courseId}/enroll`).then((r) => r.data)
  },

  isEnrolled(courseId: number) {
    return apiClient.get<{ enrolled: boolean }>(`/courses/${courseId}/enrollment-status`).then((r) => r.data.enrolled)
  },
}

function userId() {
  const user = tokenService.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export const enrollmentApi = {
  getEnrolledCourseIds(): Promise<number[]> {
    if (isMockEnabled('learn')) return Promise.resolve(getEnrolledLocal(userId()))
    return liveApi.listMine()
  },

  isEnrolled(courseId: number): Promise<boolean> {
    if (isMockEnabled('learn')) return Promise.resolve(isEnrolledLocal(userId(), courseId))
    return liveApi.isEnrolled(courseId)
  },

  enroll(courseId: number): Promise<number[]> {
    if (isMockEnabled('learn')) return Promise.resolve(enrollLocal(userId(), courseId))
    return liveApi.enroll(courseId).then(() => liveApi.listMine())
  },
}
