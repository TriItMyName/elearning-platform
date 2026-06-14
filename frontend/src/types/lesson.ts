export interface Lesson {
  id: number
  chapterId: number
  title: string
  lessonType: number
  videoUrl: string | null
  documentUrl: string | null
  duration: number | null
  content: string | null
  orderIndex: number
}

export interface CreateLessonPayload {
  title: string
  lessonType: number
  videoUrl?: string
  documentUrl?: string
  duration?: number
  content?: string
  orderIndex: number
}

export interface UpdateLessonPayload extends CreateLessonPayload {}

export interface ReorderLessonsPayload {
  lessonIds: number[]
}

export const LESSON_TYPE_LABEL: Record<number, string> = {
  0: 'Video',
  1: 'Tài liệu',
  2: 'Bài đọc',
}

export const LESSON_TYPE_OPTIONS = [
  { value: 0, label: 'Video' },
  { value: 1, label: 'Tài liệu' },
  { value: 2, label: 'Bài đọc' },
]
