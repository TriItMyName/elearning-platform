export interface AdminReportsSummary {
  totalStudents: number
  totalCourses: number
  activeEnrollments: number
  completionRate: number
  quizAttempts: number
  assignmentSubmissions: number
  topCourses: TopCourseStat[]
  recentActivity: ReportActivityItem[]
  enrollmentTrend: EnrollmentTrendPoint[]
}

export interface EnrollmentTrendPoint {
  label: string
  enrollments: number
  completions: number
}

export interface TopCourseStat {
  courseId: number
  title: string
  enrollments: number
  completionRate: number
}

export interface ReportActivityItem {
  id: number
  type: 'enrollment' | 'quiz' | 'lesson' | 'assignment'
  message: string
  at: string
}
