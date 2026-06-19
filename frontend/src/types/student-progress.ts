export interface StudentCourseProgressSummary {
  courseId: number
  courseTitle: string
  courseSlug: string
  thumbnail: string | null
  totalLessons: number
  completedLessons: number
  progress: number
  quizAttempts: number
  passedQuizAttempts: number
  averageQuizScore: number
  lastActivityAt: string | null
}

export interface StudentProgressOverview {
  totalCourses: number
  completedCourses: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
  totalQuizAttempts: number
  averageQuizScore: number
  courses: StudentCourseProgressSummary[]
}
