export interface Course {
  id: number
  categoryId: number
  instructorId: number
  title: string
  slug: string
  description: string | null
  status: number
  createdAt: string
}

export interface CreateCoursePayload {
  categoryId: number
  instructorId: number
  title: string
  slug: string
  description?: string
  status: number
  createdAt?: string
}

export interface CreateTeacherCoursePayload {
  categoryId: number
  title: string
  slug: string
  description?: string
  status: number
  createdAt?: string
}

export interface UpdateCoursePayload extends CreateCoursePayload {}
export interface UpdateTeacherCoursePayload extends CreateTeacherCoursePayload {}

export const COURSE_STATUS_LABEL: Record<number, string> = {
  0: 'Nháp',
  1: 'Đang mở',
  2: 'Đã đóng',
}

export const COURSE_STATUS_OPTIONS = [
  { value: 0, label: 'Nháp' },
  { value: 1, label: 'Đang mở' },
  { value: 2, label: 'Đã đóng' },
]
