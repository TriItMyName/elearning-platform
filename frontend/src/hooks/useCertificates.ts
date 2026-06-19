import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { certificateApi } from '@/api/certificate.api'
import { useStudentProgressOverview } from '@/hooks/useStudentProgress'
import type { Certificate, EligibleCertificateCourse } from '@/types/certificate'

export function useCertificates(enabled = true) {
  return useQuery({
    queryKey: ['student', 'certificates'],
    queryFn: () => certificateApi.list(),
    enabled,
    staleTime: 60_000,
  })
}

export function useEligibleCertificateCourses(enabled = true) {
  const progressQuery = useStudentProgressOverview(enabled)

  const eligibleCourses: EligibleCertificateCourse[] =
    progressQuery.data?.courses
      .filter((course) => (course.progress ?? 0) >= 100)
      .map((course) => ({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        courseSlug: course.courseSlug,
        progress: course.progress ?? 100,
      })) ?? []

  return {
    eligibleCourses,
    isLoading: progressQuery.isLoading,
  }
}

export function useClaimCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: number) => certificateApi.generate(courseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['student', 'certificates'] })
    },
  })
}

export function useDownloadCertificatePdf() {
  return useMutation({
    mutationFn: async (certificate: Certificate) => {
      const blob = await certificateApi.downloadPdf(certificate.courseId)
      return { blob, certificate }
    },
  })
}
