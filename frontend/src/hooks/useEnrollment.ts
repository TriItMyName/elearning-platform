import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { enrollmentApi } from '@/api/enrollment.api'
import { useAuth } from '@/auth/auth.context'
import { useCourses } from '@/hooks/useCourses'
import { getLastLessonId } from '@/lib/learn-progress.storage'
import type { Course } from '@/types/course'

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

export function useEnrollCourse() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (courseId: number) => enrollmentApi.enroll(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['enrollment', user?.id] })
    },
  })
}

export function useEnrolledCourses() {
  const { data: enrolledIds = [], isLoading: idsLoading } = useEnrolledCourseIds()
  const { data: coursesPage, isLoading: coursesLoading } = useCourses({ page: 0, size: 100 })

  const courses =
    coursesPage?.content.filter((c) => enrolledIds.includes(c.id)) ?? []

  return {
    courses,
    isLoading: idsLoading || coursesLoading,
  }
}

export function useContinueLearnUrl(course: Course | null | undefined) {
  const { user } = useAuth()
  if (!course || !user) return course ? `/learn/${course.slug}` : '/courses'
  const lastId = getLastLessonId(user.id, course.id)
  return lastId ? `/learn/${course.slug}?lesson=${lastId}` : `/learn/${course.slug}`
}
