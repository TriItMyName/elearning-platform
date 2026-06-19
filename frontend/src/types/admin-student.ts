export interface AdminStudentOverview {
  id: number
  username: string
  fullName: string
  email: string
  enrolledCourses: number
  averageProgress: number | null
  lastEnrolledAt: string | null
}

export interface AdminStudentEnrollment {
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

export interface AdminStudentLearning {
  id: number
  username: string
  fullName: string
  email: string
  enrolledCourses: number
  averageProgress: number | null
  enrollments: AdminStudentEnrollment[]
}
