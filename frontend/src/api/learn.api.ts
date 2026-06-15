import { chaptersApi } from '@/api/chapters.api'
import { coursesApi } from '@/api/courses.api'
import { lessonsApi } from '@/api/lessons.api'
import { apiClient } from '@/api/client'
import { tokenService } from '@/auth/token.service'
import { isMockEnabled } from '@/lib/mock-mode'
import {
  getCompletedLessonIds,
  markLessonComplete as markProgressLocal,
  setLastLessonId,
} from '@/lib/learn-progress.storage'
import { isEnrolled } from '@/lib/enrollment.storage'
import { learnMockApi } from '@/mocks/learn.mock'
import type { Course } from '@/types/course'
import type { LearnCourse, LearnChapter, LearnLesson, MarkLessonCompletePayload } from '@/types/learn'
import type { Lesson } from '@/types/lesson'

/** Bài có quiz trong mock — thay bằng API student quiz khi BE sẵn sàng */
const MOCK_QUIZ_LESSON_IDS = new Set([102, 201])

const liveApi = {
  getCourseBySlug(slug: string) {
    return apiClient.get<LearnCourse>(`/learn/courses/${slug}`).then((r) => r.data)
  },

  markLessonComplete(payload: MarkLessonCompletePayload) {
    return apiClient
      .post<{ completedLessonIds: number[] }>('/learn/progress/complete', payload)
      .then((r) => r.data)
  },
}

function mapLesson(courseId: number, chapterId: number, lesson: Lesson, completedIds: Set<number>): LearnLesson {
  return {
    ...lesson,
    courseId,
    chapterId,
    completed: completedIds.has(lesson.id),
    hasQuiz: MOCK_QUIZ_LESSON_IDS.has(lesson.id),
  }
}

function fallbackLessons(course: Course, chapterId: number, orderIndex: number): LearnLesson[] {
  const baseId = chapterId * 100 + orderIndex * 10
  return [
    {
      id: baseId + 1,
      chapterId,
      courseId: course.id,
      title: 'Bài học video',
      lessonType: 0,
      videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      documentUrl: null,
      duration: 600,
      content: null,
      orderIndex: 0,
      completed: false,
      hasQuiz: MOCK_QUIZ_LESSON_IDS.has(baseId + 1),
    },
    {
      id: baseId + 2,
      chapterId,
      courseId: course.id,
      title: 'Bài đọc bổ sung',
      lessonType: 2,
      videoUrl: null,
      documentUrl: null,
      duration: null,
      content: `Nội dung mẫu cho chương. Khi API bài học học viên sẵn sàng, thay bằng dữ liệu thật từ backend.`,
      orderIndex: 1,
      completed: false,
      hasQuiz: false,
    },
  ]
}

async function buildFromRealApis(course: Course, userId: number): Promise<LearnCourse | null> {
  const completedIds = new Set(getCompletedLessonIds(userId, course.id))

  try {
    const chaptersPage = await chaptersApi.listByCourse(course.id, {
      page: 0,
      size: 100,
      sortBy: 'orderIndex',
    })
    const rawChapters = chaptersPage.content
    if (rawChapters.length === 0) return null

    const chapters: LearnChapter[] = []

    for (const chapter of rawChapters) {
      let lessons: LearnLesson[] = []
      try {
        const lessonsPage = await lessonsApi.listByChapter(course.id, chapter.id, {
          page: 0,
          size: 100,
          sortBy: 'orderIndex',
        })
        if (lessonsPage.content.length > 0) {
          lessons = lessonsPage.content.map((l) => mapLesson(course.id, chapter.id, l, completedIds))
        }
      } catch {
        // Học viên chưa có API lesson — dùng placeholder gắn chapter thật
      }

      if (lessons.length === 0) {
        lessons = fallbackLessons(course, chapter.id, chapter.orderIndex).map((l) => ({
          ...l,
          completed: completedIds.has(l.id),
        }))
      }

      chapters.push({
        id: chapter.id,
        courseId: course.id,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        lessons,
      })
    }

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      chapters,
      completedLessonIds: Array.from(completedIds),
    }
  } catch {
    return null
  }
}

export const learnApi = {
  async getCourseBySlug(slug: string): Promise<LearnCourse> {
    const page = await coursesApi.list({ page: 0, size: 100 })
    const course = page.content.find((c) => c.slug === slug)
    if (!course) throw new Error('Course not found')

    if (!isMockEnabled('learn')) {
      return liveApi.getCourseBySlug(slug)
    }

    const user = tokenService.getUser()
    if (user && !isEnrolled(user.id, course.id)) {
      throw new Error('Not enrolled')
    }

    const fromApi = user ? await buildFromRealApis(course, user.id) : null
    if (fromApi) return fromApi

    return learnMockApi.getCourseBySlug(course, user?.id ?? 0)
  },

  markLessonComplete(payload: MarkLessonCompletePayload) {
    if (isMockEnabled('learn')) {
      const user = tokenService.getUser()
      if (!user) throw new Error('Unauthorized')
      const completedLessonIds = markProgressLocal(user.id, payload.courseId, payload.lessonId)
      setLastLessonId(user.id, payload.courseId, payload.lessonId)
      return Promise.resolve({ completedLessonIds })
    }
    return liveApi.markLessonComplete(payload)
  },
}
