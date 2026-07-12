import { apiClient } from '@/api/client'
import { coursesApi } from '@/api/courses.api'
import type { Course } from '@/types/course'
import type { LearnChapter, LearnCourse, LearnLesson, MarkLessonCompletePayload } from '@/types/learn'
import type { Lesson } from '@/types/lesson'
import type { TeacherStudentProgress } from '@/types/teacher'

interface CourseChapterContent {
  id: number
  courseId: number
  title: string
  orderIndex: number
  lessons: Lesson[]
}

interface CourseContentResponse {
  course: Course
  chapters: CourseChapterContent[]
}

function toLearnCourse(
  content: CourseContentResponse,
  progress: TeacherStudentProgress,
): LearnCourse {
  const completedLessonIds = progress.lessons
    .filter((lesson) => lesson.completed)
    .map((lesson) => lesson.lessonId)
  const completed = new Set(completedLessonIds)

  const chapters: LearnChapter[] = content.chapters.map((chapter) => ({
    id: chapter.id,
    courseId: chapter.courseId,
    title: chapter.title,
    orderIndex: chapter.orderIndex,
    lessons: chapter.lessons.map(
      (lesson): LearnLesson => ({
        ...lesson,
        courseId: content.course.id,
        chapterId: chapter.id,
        completed: completed.has(lesson.id),
        hasQuiz: Boolean(lesson.quizzes?.length),
      }),
    ),
  }))

  return {
    id: content.course.id,
    slug: content.course.slug,
    title: content.course.title,
    description: content.course.description,
    chapters,
    completedLessonIds,
  }
}

export const learnApi = {
  async getCourseBySlug(slug: string): Promise<LearnCourse> {
    const page = await coursesApi.list({ page: 0, size: 1000, sortBy: 'id', direction: 'asc' })
    const course = page.content.find((item) => item.slug === slug)
    if (!course) throw new Error('Course not found')

    const [content, progress] = await Promise.all([
      apiClient
        .get<CourseContentResponse>(`/courses/${course.id}/content/student`)
        .then((response) => response.data),
      apiClient
        .get<TeacherStudentProgress>(`/courses/${course.id}/progress/student`)
        .then((response) => response.data),
    ])

    return toLearnCourse(content, progress)
  },

  async markLessonComplete(payload: MarkLessonCompletePayload) {
    const progress = await apiClient
      .post<TeacherStudentProgress>(
        `/courses/${payload.courseId}/lessons/${payload.lessonId}/progress/student/complete`,
      )
      .then((response) => response.data)

    return {
      completedLessonIds: progress.lessons
        .filter((lesson) => lesson.completed)
        .map((lesson) => lesson.lessonId),
    }
  },
}
