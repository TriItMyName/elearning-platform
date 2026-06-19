export interface TeacherStudentsQueryParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

export interface TeacherEnrollment {
  enrollmentId: number
  courseId: number
  courseTitle: string
  courseSlug: string
  studentId: number
  username: string
  fullName: string
  email: string
  progress: number | null
  enrolledAt: string
}

export interface TeacherProgressLesson {
  id: number
  enrollmentId: number
  lessonId: number
  lessonTitle: string
  lessonOrderIndex: number
  completed: boolean
  completedAt: string | null
  updatedAt: string | null
}

export interface TeacherStudentProgress {
  enrollmentId: number
  courseId: number
  studentId: number
  studentName: string
  studentEmail: string
  totalLessons: number
  completedLessons: number
  progress: number
  lessons: TeacherProgressLesson[]
}

export interface TeacherNotificationPayload {
  message: string
}

export interface TeacherNotification {
  id: number
  senderId: number
  senderName: string
  receiverId: number
  receiverName: string
  courseId: number
  courseTitle: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface ImportQuizDocumentPayload {
  file: File
  timeLimit?: number
  passScore: number
}
