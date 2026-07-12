import { useQuery } from '@tanstack/react-query'

import { categoriesApi } from '@/api/categories.api'
import { coursesApi, type CoursesQueryParams } from '@/api/courses.api'

export function useCourses(params: CoursesQueryParams = { page: 0, size: 50 }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.list(params),
  })
}

export function useCourse(id: number | null) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.getById(id!),
    enabled: id != null && id > 0,
  })
}

export function useCourseBySlug(slug: string, courses?: { id: number; slug: string }[]) {
  const match = courses?.find((c) => c.slug === slug)
  return useCourse(match?.id ?? null)
}

export function useMyCourses(params: CoursesQueryParams = { page: 0, size: 50 }) {
  return useQuery({
    queryKey: ['courses', 'my', params],
    queryFn: () => coursesApi.myCourses(params),
  })
}

export function useCategories(params = { page: 0, size: 100 }) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.list(params),
  })
}

const SEARCH_COURSES_PARAMS = { page: 0, size: 100 } as const

export function useSearchCourses(query: string) {
  const normalized = query.trim().toLowerCase()
  const enabled = normalized.length >= 2

  const { data } = useQuery({
    queryKey: ['courses', SEARCH_COURSES_PARAMS],
    queryFn: () => coursesApi.list(SEARCH_COURSES_PARAMS),
    enabled,
    staleTime: 60_000,
  })

  const courses = data?.content ?? []

  return {
    data: enabled
      ? courses.filter(
          (c) =>
            c.title.toLowerCase().includes(normalized) ||
            c.slug.toLowerCase().includes(normalized),
        )
      : [],
  }
}
