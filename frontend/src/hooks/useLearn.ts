import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { learnApi } from '@/api/learn.api'
import { quizStudentApi } from '@/api/quiz-student.api'
import type { LearnCourse, MarkLessonCompletePayload } from '@/types/learn'

export function useLearnCourse(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['learn', slug],
    queryFn: () => learnApi.getCourseBySlug(slug),
    enabled: Boolean(slug) && (options?.enabled ?? true),
  })
}

export function useMarkLessonComplete(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MarkLessonCompletePayload) => learnApi.markLessonComplete(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learn', slug] })
    },
  })
}

export function useQuizAttemptedLessonIds(
  course: LearnCourse | undefined,
  options?: { enabled?: boolean },
) {
  const quizLessons = useMemo(
    () =>
      course?.chapters.flatMap((chapter) =>
        chapter.lessons
          .filter((lesson) => lesson.hasQuiz)
          .map((lesson) => ({ ...lesson, chapterId: chapter.id })),
      ) ?? [],
    [course],
  )

  const attemptsQueries = useQueries({
    queries: quizLessons.map((lesson) => ({
      queryKey: ['quiz-attempts', course!.id, lesson.chapterId, lesson.id],
      queryFn: () => quizStudentApi.listAttempts(course!.id, lesson.chapterId, lesson.id),
      enabled: Boolean(course) && (options?.enabled ?? true),
    })),
  })

  return useMemo(() => {
    const ids = new Set<number>()
    quizLessons.forEach((lesson, index) => {
      const attempts = attemptsQueries[index]?.data
      if (attempts?.length) ids.add(lesson.id)
    })
    return ids
  }, [quizLessons, attemptsQueries])
}
