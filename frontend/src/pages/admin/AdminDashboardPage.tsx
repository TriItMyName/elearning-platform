import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FolderTree,
  HelpCircle,
  KeyRound,
  Shield,
  TrendingUp,
  UserCircle,
  Users,
  Video,
} from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import { coursesApi } from '@/api/courses.api'
import { DashboardActivityFeed } from '@/components/admin/dashboard/DashboardActivityFeed'
import { DashboardCompletionRing } from '@/components/admin/dashboard/DashboardCompletionRing'
import { DashboardEnrollmentChart } from '@/components/admin/dashboard/DashboardEnrollmentChart'
import { DashboardHero } from '@/components/admin/dashboard/DashboardHero'
import { type DashboardMetric } from '@/components/admin/dashboard/DashboardMetricCard'
import { DashboardMetricsGrid } from '@/components/admin/dashboard/DashboardMetricsGrid'
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions'
import { DashboardTopCourses } from '@/components/admin/dashboard/DashboardTopCourses'
import { useDashboardEnter } from '@/components/admin/dashboard/dashboard-motion'
import { useReportsSummary } from '@/hooks/useReports'

export function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const reportsQuery = useReportsSummary()
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', 'stats', 'students'],
    queryFn: () => adminApi.users.list({ page: 0, size: 1, role: 'STUDENT' }),
  })
  const accountsQuery = useQuery({
    queryKey: ['admin', 'users', 'stats', 'all'],
    queryFn: () => adminApi.users.list({ page: 0, size: 1 }),
  })
  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminApi.roles.list(),
  })
  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminApi.permissions.list(),
  })
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.categories.list(),
  })
  const coursesQuery = useQuery({
    queryKey: ['courses', 'dashboard'],
    queryFn: () => coursesApi.list({ page: 0, size: 1 }),
  })

  const isLoading =
    reportsQuery.isLoading ||
    usersQuery.isLoading ||
    accountsQuery.isLoading ||
    coursesQuery.isLoading ||
    categoriesQuery.isLoading ||
    rolesQuery.isLoading ||
    permissionsQuery.isLoading

  const contentReady = !isLoading
  useDashboardEnter(containerRef, contentReady)

  const reports = reportsQuery.data

  const metrics = useMemo<DashboardMetric[]>(() => {
    const students = usersQuery.data?.totalElements ?? reports?.totalStudents ?? 0
    const courses = coursesQuery.data?.totalElements ?? reports?.totalCourses ?? 0
    const categories = categoriesQuery.data?.length ?? 0
    const roles = rolesQuery.data?.length ?? 0
    const accounts = accountsQuery.data?.totalElements ?? 0
    const permissions = permissionsQuery.data?.length ?? 0

    return [
      {
        id: 'students',
        label: 'Học viên',
        value: students,
        icon: Users,
        to: '/admin/users',
        trend: 12,
        accent: 'orange',
      },
      {
        id: 'courses',
        label: 'Khóa học',
        value: courses,
        icon: BookOpen,
        to: '/admin/courses',
        trend: 8,
        accent: 'blue',
      },
      {
        id: 'active-enrollments',
        label: 'Đăng ký đang học',
        value: reports?.activeEnrollments ?? 0,
        icon: TrendingUp,
        to: '/admin/reports',
        trend: 18,
        accent: 'emerald',
      },
      {
        id: 'categories',
        label: 'Danh mục',
        value: categories,
        icon: FolderTree,
        to: '/admin/categories',
        accent: 'violet',
      },
      {
        id: 'roles',
        label: 'Vai trò',
        value: roles,
        icon: Shield,
        to: '/admin/roles',
        accent: 'violet',
      },
      {
        id: 'completion-rate',
        label: 'Tỷ lệ hoàn thành',
        value: reports?.completionRate ?? 0,
        suffix: '%',
        icon: BarChart3,
        to: '/admin/reports',
        trend: 5,
        accent: 'emerald',
      },
      {
        id: 'quiz-attempts',
        label: 'Lượt làm quiz',
        value: reports?.quizAttempts ?? 0,
        icon: HelpCircle,
        to: '/admin/quizzes',
        trend: 22,
        accent: 'amber',
      },
      {
        id: 'assignments',
        label: 'Bài tập đã nộp',
        value: reports?.assignmentSubmissions ?? 0,
        icon: ClipboardList,
        to: '/admin/assignments',
        trend: 14,
        accent: 'rose',
      },
      {
        id: 'accounts',
        label: 'Tài khoản hệ thống',
        value: accounts,
        icon: UserCircle,
        to: '/admin/accounts',
        trend: 6,
        accent: 'blue',
      },
      {
        id: 'permissions',
        label: 'Quyền hệ thống',
        value: permissions,
        icon: KeyRound,
        to: '/admin/roles',
        accent: 'amber',
      },
    ]
  }, [
    usersQuery.data,
    accountsQuery.data,
    coursesQuery.data,
    categoriesQuery.data,
    rolesQuery.data,
    permissionsQuery.data,
    reports,
  ])

  const shortcuts = [
    { to: '/admin/courses', label: 'Khóa học', desc: 'Tạo và xuất bản khóa học mới', icon: BookOpen },
    { to: '/admin/lessons', label: 'Bài học', desc: 'Chương, video và nội dung bài giảng', icon: Video },
    { to: '/admin/quizzes', label: 'Quiz', desc: 'Câu hỏi trắc nghiệm và điểm đạt', icon: HelpCircle },
    { to: '/admin/assignments', label: 'Bài tập', desc: 'Giao bài và hạn nộp cho học viên', icon: ClipboardList },
    { to: '/admin/categories', label: 'Danh mục', desc: 'Phân loại khóa học trên trang chủ', icon: FolderTree },
    { to: '/admin/reports', label: 'Báo cáo', desc: 'Thống kê chi tiết và xuất dữ liệu', icon: BarChart3 },
  ]

  return (
    <div ref={containerRef} className="space-y-6">
      <DashboardHero />

      <DashboardMetricsGrid metrics={metrics} ready={contentReady} loading={isLoading} />

      {reports ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardEnrollmentChart data={reports.enrollmentTrend ?? []} ready={contentReady} />
            </div>
            <DashboardCompletionRing
              percent={reports.completionRate}
              quizAttempts={reports.quizAttempts}
              assignmentSubmissions={reports.assignmentSubmissions}
              ready={contentReady}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardTopCourses courses={reports.topCourses} />
            <DashboardActivityFeed items={reports.recentActivity} />
          </div>
        </>
      ) : reportsQuery.isError ? (
        <div className="rounded-2xl border border-dashed border-[#ececec] bg-white px-6 py-10 text-center">
          <p className="text-sm text-[#6b7280]">Không tải được dữ liệu báo cáo.</p>
          <Link to="/admin/reports" className="mt-3 inline-block text-sm font-semibold text-[#f05123] hover:underline">
            Mở trang báo cáo
          </Link>
        </div>
      ) : null}

      <DashboardQuickActions actions={shortcuts} />
    </div>
  )
}
