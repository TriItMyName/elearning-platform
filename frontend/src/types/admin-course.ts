export type AdminCourseStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface AdminCourse {
  id: number
  categoryId: number
  instructorId: number
  instructorName: string | null
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  adminStatus: AdminCourseStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAdminCoursePayload {
  categoryId: number
  instructorId: number
  title: string
  description?: string
  thumbnail?: string
  adminStatus?: AdminCourseStatus
}

export interface UpdateAdminCoursePayload {
  id?: number
  categoryId?: number
  instructorId?: number
  title?: string
  description?: string
  thumbnail?: string
  adminStatus?: AdminCourseStatus
}

export const ADMIN_COURSE_STATUS_LABEL: Record<AdminCourseStatus, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Lưu trữ',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

export const ADMIN_COURSE_STATUS_OPTIONS: { value: AdminCourseStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]

export interface AdminChapter {
  id: number
  courseId: number
  title: string
  orderIndex: number
}

export interface CreateAdminChapterPayload {
  courseId: number
  title: string
  orderIndex: number
}

export type UpdateAdminChapterPayload = Partial<CreateAdminChapterPayload>

export interface AdminLesson {
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

export interface CreateAdminLessonPayload {
  chapterId: number
  title: string
  lessonType: number
  videoUrl?: string
  documentUrl?: string
  duration?: number
  content?: string
  orderIndex: number
}

export type UpdateAdminLessonPayload = Partial<CreateAdminLessonPayload>
