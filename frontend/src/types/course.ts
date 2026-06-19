export interface Course {
  id: number
  categoryId: number
  instructorId: number
  title: string
  slug: string
  description: string | null
  thumbnail?: string | null
  status: number
  adminStatus?: string | null
  createdAt: string
  upDateTime?: string | null
  enrolled?: boolean | null
}

export interface CreateCoursePayload {
  categoryId: number
  instructorId: number
  title: string
  slug: string
  description?: string
  thumbnail?: string
  status: number
  createdAt?: string
}

export interface CreateTeacherCoursePayload {
  categoryId: number
  title: string
  slug: string
  description?: string
  thumbnail?: string
  submitForReview?: boolean
  createdAt?: string
}

export type UpdateTeacherCoursePayload = CreateTeacherCoursePayload
export type UpdateCoursePayload = CreateCoursePayload

export type TeacherCoursePublishMode = 'draft' | 'submit'

export type TeacherCourseAdminStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'

export const TEACHER_COURSE_ADMIN_STATUS_LABEL: Record<TeacherCourseAdminStatus, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ duyệt',
  PUBLISHED: 'Đã công khai',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  ARCHIVED: 'Lưu trữ',
}

export const TEACHER_COURSE_ADMIN_STATUS_OPTIONS: {
  value: TeacherCourseAdminStatus
  label: string
}[] = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'PUBLISHED', label: 'Đã công khai' },
  { value: 'REJECTED', label: 'Từ chối' },
]

export const TEACHER_COURSE_PUBLISH_OPTIONS: {
  value: TeacherCoursePublishMode
  label: string
  description: string
}[] = [
  {
    value: 'draft',
    label: 'Nháp',
    description: 'Lưu riêng, chưa gửi admin duyệt.',
  },
  {
    value: 'submit',
    label: 'Gửi duyệt',
    description: 'Gửi admin duyệt. Sau khi duyệt, khóa học mới được công khai.',
  },
]

export function toTeacherPublishMode(adminStatus?: string | null): TeacherCoursePublishMode {
  if (
    adminStatus === 'PENDING' ||
    adminStatus === 'PUBLISHED' ||
    adminStatus === 'APPROVED' ||
    adminStatus === 'REJECTED'
  ) {
    return 'submit'
  }
  return 'draft'
}

export function teacherAdminStatusLabel(adminStatus?: string | null) {
  if (!adminStatus) return 'Nháp'
  return TEACHER_COURSE_ADMIN_STATUS_LABEL[adminStatus as TeacherCourseAdminStatus] ?? adminStatus
}

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
