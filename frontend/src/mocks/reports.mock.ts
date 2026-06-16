import type { AdminReportsSummary } from '@/types/reports'

const MOCK_REPORTS: AdminReportsSummary = {
  totalStudents: 128,
  totalCourses: 12,
  activeEnrollments: 342,
  completionRate: 67,
  quizAttempts: 891,
  assignmentSubmissions: 456,
  topCourses: [
    { courseId: 1, title: 'HTML CSS cơ bản', enrollments: 89, completionRate: 72 },
    { courseId: 2, title: 'JavaScript nâng cao', enrollments: 64, completionRate: 58 },
    { courseId: 3, title: 'React cho người mới', enrollments: 51, completionRate: 61 },
  ],
  recentActivity: [
    { id: 1, type: 'enrollment', message: 'Nguyễn Văn A đăng ký khóa React cho người mới', at: new Date().toISOString() },
    { id: 2, type: 'quiz', message: 'Trần Thị B hoàn thành quiz bài 3 — 8/10 điểm', at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, type: 'lesson', message: 'Lê Văn C hoàn thành bài học "Flexbox layout"', at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, type: 'assignment', message: 'Phạm D nộp bài tập thực hành HTML', at: new Date(Date.now() - 86400000).toISOString() },
    { id: 5, type: 'enrollment', message: 'Hoàng E ghi danh khóa JavaScript nâng cao', at: new Date(Date.now() - 172800000).toISOString() },
  ],
  enrollmentTrend: [
    { label: 'T10', enrollments: 42, completions: 28 },
    { label: 'T11', enrollments: 58, completions: 35 },
    { label: 'T12', enrollments: 71, completions: 44 },
    { label: 'T1', enrollments: 65, completions: 41 },
    { label: 'T2', enrollments: 89, completions: 52 },
    { label: 'T3', enrollments: 94, completions: 61 },
    { label: 'T4', enrollments: 112, completions: 68 },
  ],
}

export const reportsMockApi = {
  getSummary(): Promise<AdminReportsSummary> {
    return Promise.resolve(structuredClone(MOCK_REPORTS))
  },
}
