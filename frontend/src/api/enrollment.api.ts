import { apiClient } from '@/api/client'
import type { PageResponse } from '@/types/api'
import type { Course } from '@/types/course'
import type { TeacherEnrollment } from '@/types/teacher'

export const enrollmentApi = {
  async getEnrolledCourseIds(): Promise<number[]> {
    const { data } = await apiClient.get<PageResponse<Course>>('/courses', {
      params: { page: 0, size: 1000, sortBy: 'id', direction: 'asc' },
    })
    return data.content.filter((course) => course.enrolled === true).map((course) => course.id)
  },

  isEnrolled(courseId: number): Promise<boolean> {
    return enrollmentApi.getEnrolledCourseIds().then((ids) => ids.includes(courseId))
  },

  enroll(courseId: number): Promise<number[]> {
    return apiClient
      .post<TeacherEnrollment>(`/courses/${courseId}/enroll`)
      .then(() => enrollmentApi.getEnrolledCourseIds())
  },
}
