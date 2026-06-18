export type AdminCourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface AdminCourse {
  id: number
  categoryId: number
  instructorId: number
  title: string
  slug: string
  description: string | null
  adminStatus: AdminCourseStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAdminCoursePayload {
  categoryId: number
  instructorId: number
  title: string
  description?: string
  adminStatus?: AdminCourseStatus
}

export interface UpdateAdminCoursePayload {
  id?: number
  categoryId?: number
  instructorId?: number
  title?: string
  description?: string
  adminStatus?: AdminCourseStatus
}

export const ADMIN_COURSE_STATUS_LABEL: Record<AdminCourseStatus, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Lưu trữ',
}

export const ADMIN_COURSE_STATUS_OPTIONS: { value: AdminCourseStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
]
