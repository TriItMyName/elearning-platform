import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { enrollmentApi } from '@/api/enrollment.api'
import { useAuth } from '@/auth/auth.context'
import { useCourses } from '@/hooks/useCourses'
import { useStudentProgressOverview } from '@/hooks/useStudentProgress'
import { getLastLessonId } from '@/lib/learn-progress.storage'
import type { Course } from '@/types/course'

export type EnrolledCourse = Course & {
  enrollmentProgress: number
}

export function useEnrolledCourseIds() {
  const { isAuthenticated, user } = useAuth()
  return useQuery({
    queryKey: ['enrollment', user?.id],
    queryFn: () => enrollmentApi.getEnrolledCourseIds(),
    enabled: isAuthenticated && user != null,
  })
}

export function useCourseEnrollment(courseId: number | null) {
  const { isAuthenticated, user } = useAuth()
  return useQuery({
    queryKey: ['enrollment', user?.id, courseId],
    queryFn: () => enrollmentApi.isEnrolled(courseId!),
    enabled: isAuthenticated && user != null && courseId != null,
  })
}

export function useCourseStudentCount(courseId: number | null) {
  return useQuery({
    queryKey: ['courses', courseId, 'student-count'],
    queryFn: () => enrollmentApi.countStudents(courseId!),
    enabled: courseId != null,
  })
}

export function useEnrollCourse() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (courseId: number) => enrollmentApi.enroll(courseId),
    onSuccess: (_data, courseId) => {
      void queryClient.invalidateQueries({ queryKey: ['enrollment', user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'student-count'] })
    },
  })
}

export function useEnrolledCourses() {
  const { isAuthenticated, user } = useAuth()
  const { data: enrolledIds = [], isLoading: idsLoading } = useEnrolledCourseIds()
  const { data: coursesPage, isLoading: coursesLoading } = useCourses({ page: 0, size: 100 })
  const { data: progressOverview, isLoading: progressLoading } = useStudentProgressOverview(
    isAuthenticated && user != null,
  )

  const progressByCourseId = new Map<number, number>()
  for (const item of progressOverview?.courses ?? []) {
    progressByCourseId.set(item.courseId, Math.round(item.progress ?? 0))
  }

  const courses: EnrolledCourse[] =
    coursesPage?.content
      .filter((course) => enrolledIds.includes(course.id))
      .map((course) => ({
        ...course,
        enrollmentProgress: progressByCourseId.get(course.id) ?? 0,
      })) ?? []

  return {
    courses,
    isLoading: idsLoading || coursesLoading || progressLoading,
  }
}

export function useContinueLearnUrl(course: Course | null | undefined) {
  const { user } = useAuth()
  if (!course || !user) return course ? `/learn/${course.slug}` : '/courses'
  const lastId = getLastLessonId(user.id, course.id)
  return lastId ? `/learn/${course.slug}?lesson=${lastId}` : `/learn/${course.slug}`
}
