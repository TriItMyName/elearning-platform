export interface AdminDashboardSummary {
  totalStudents: number
  totalCourses: number
  activeEnrollments: number
  completionRate: number
  quizAttempts: number
  topCourses: DashboardTopCourse[]
  recentActivity: DashboardActivityItem[]
  enrollmentTrend: DashboardEnrollmentTrendPoint[]
}

export interface DashboardEnrollmentTrendPoint {
  label: string
  enrollments: number
  completions: number
}

export interface DashboardTopCourse {
  courseId: number
  title: string
  enrollments: number
  completionRate: number
}

export interface DashboardActivityItem {
  id: number
  type: 'enrollment' | 'quiz' | 'lesson'
  message: string
  at: string
}
