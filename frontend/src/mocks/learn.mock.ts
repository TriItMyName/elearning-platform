import type { Course } from '@/types/course'
import type { LearnCourse, LearnLesson, MarkLessonCompletePayload } from '@/types/learn'
import {
  getCompletedLessonIds,
  markLessonComplete as markProgressLocal,
} from '@/lib/learn-progress.storage'

const QUIZ_LESSON_IDS = new Set([102, 201])

function buildCurriculum(course: Course, userId: number): LearnCourse {
  const completedIds = new Set(getCompletedLessonIds(userId, course.id))

  const mk = (lesson: Omit<LearnLesson, 'completed'>): LearnLesson => ({
    ...lesson,
    completed: completedIds.has(lesson.id),
  })

  const chapter1Lessons: LearnLesson[] = [
    mk({
      id: 101,
      chapterId: 1,
      courseId: course.id,
      title: 'Giới thiệu khóa học',
      lessonType: 0,
      videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      documentUrl: null,
      duration: 600,
      content: 'Video giới thiệu tổng quan nội dung khóa học.',
      orderIndex: 0,
      hasQuiz: false,
    }),
    mk({
      id: 102,
      chapterId: 1,
      courseId: course.id,
      title: 'Thiết lập môi trường',
      lessonType: 0,
      videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      documentUrl: null,
      duration: 900,
      content: null,
      orderIndex: 1,
      hasQuiz: QUIZ_LESSON_IDS.has(102),
    }),
    mk({
      id: 103,
      chapterId: 1,
      courseId: course.id,
      title: 'Đọc thêm: tài liệu tham khảo',
      lessonType: 2,
      videoUrl: null,
      documentUrl: null,
      duration: null,
      content: 'Nội dung bài đọc mẫu.',
      orderIndex: 2,
      hasQuiz: false,
    }),
  ]

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    completedLessonIds: Array.from(completedIds),
    chapters: [
      {
        id: 1,
        courseId: course.id,
        title: 'Chương 1 — Bắt đầu',
        orderIndex: 0,
        lessons: chapter1Lessons,
      },
      {
        id: 2,
        courseId: course.id,
        title: 'Chương 2 — Thực hành',
        orderIndex: 1,
        lessons: [
          mk({
            id: 201,
            chapterId: 2,
            courseId: course.id,
            title: 'Bài lab đầu tiên',
            lessonType: 0,
            videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
            documentUrl: null,
            duration: 1200,
            content: null,
            orderIndex: 0,
            hasQuiz: QUIZ_LESSON_IDS.has(201),
          }),
        ],
      },
    ],
  }
}

const cache = new Map<string, LearnCourse>()

export const learnMockApi = {
  getCourseBySlug(course: Course, userId: number): Promise<LearnCourse> {
    const cacheKey = `${course.slug}:${userId}`
    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, buildCurriculum(course, userId))
    }
    const completedIds = new Set(getCompletedLessonIds(userId, course.id))
    const data = structuredClone(cache.get(cacheKey)!)
    data.completedLessonIds = Array.from(completedIds)
    data.chapters = data.chapters.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => ({ ...l, completed: completedIds.has(l.id) })),
    }))
    return Promise.resolve(data)
  },

  markLessonComplete(payload: MarkLessonCompletePayload, userId: number): Promise<{ completedLessonIds: number[] }> {
    const ids = markProgressLocal(userId, payload.courseId, payload.lessonId)
    return Promise.resolve({ completedLessonIds: ids })
  },
}
