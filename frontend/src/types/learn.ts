import type { Lesson } from '@/types/lesson'

export interface LearnLesson extends Lesson {
  courseId: number
  completed: boolean
  hasQuiz: boolean
}

export interface LearnChapter {
  id: number
  courseId: number
  title: string
  orderIndex: number
  lessons: LearnLesson[]
}

export interface LearnCourse {
  id: number
  slug: string
  title: string
  description: string | null
  chapters: LearnChapter[]
  completedLessonIds: number[]
}

export interface MarkLessonCompletePayload {
  courseId: number
  lessonId: number
}
