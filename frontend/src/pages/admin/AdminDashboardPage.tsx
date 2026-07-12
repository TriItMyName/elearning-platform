import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
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

import { adminApi } from '@/api/admin.api'
import { DashboardActivityFeed } from '@/components/admin/dashboard/DashboardActivityFeed'
import { DashboardCompletionRing } from '@/components/admin/dashboard/DashboardCompletionRing'
import { DashboardEnrollmentChart } from '@/components/admin/dashboard/DashboardEnrollmentChart'
import { DashboardHero } from '@/components/admin/dashboard/DashboardHero'
import { type DashboardMetric } from '@/components/admin/dashboard/DashboardMetricCard'
import { DashboardMetricsGrid } from '@/components/admin/dashboard/DashboardMetricsGrid'
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions'
import { DashboardTopCourses } from '@/components/admin/dashboard/DashboardTopCourses'
import { useDashboardEnter } from '@/components/admin/dashboard/dashboard-motion'
import { Button } from '@/components/ui/Button'
import { useDashboardSummary } from '@/hooks/useDashboard'

export function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const dashboardQuery = useDashboardSummary()
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
    queryFn: () => adminApi.categories.list({ page: 0, size: 1 }),
  })

  const isLoading =
    dashboardQuery.isLoading ||
    accountsQuery.isLoading ||
    categoriesQuery.isLoading ||
    rolesQuery.isLoading ||
    permissionsQuery.isLoading

  const contentReady = !isLoading
  useDashboardEnter(containerRef, contentReady)

  const summary = dashboardQuery.data

  const metrics = useMemo<DashboardMetric[]>(() => {
    const categories = categoriesQuery.data?.totalElements ?? 0
    const roles = rolesQuery.data?.length ?? 0
    const accounts = accountsQuery.data?.totalElements ?? 0
    const permissions = permissionsQuery.data?.length ?? 0

    return [
      {
        id: 'students',
        label: 'Học viên',
        value: summary?.totalStudents ?? 0,
        icon: Users,
        to: '/admin/users',
        accent: 'orange',
      },
      {
        id: 'courses',
        label: 'Khóa học',
        value: summary?.totalCourses ?? 0,
        icon: BookOpen,
        to: '/admin/courses',
        accent: 'blue',
      },
      {
        id: 'active-enrollments',
        label: 'Đăng ký đang học',
        value: summary?.activeEnrollments ?? 0,
        icon: TrendingUp,
        to: '/admin/courses',
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
        value: summary?.completionRate ?? 0,
        suffix: '%',
        icon: BarChart3,
        to: '/admin/courses',
        accent: 'emerald',
      },
      {
        id: 'quiz-attempts',
        label: 'Lượt làm quiz',
        value: summary?.quizAttempts ?? 0,
        icon: HelpCircle,
        to: '/admin/courses',
        accent: 'amber',
      },
      {
        id: 'accounts',
        label: 'Tài khoản hệ thống',
        value: accounts,
        icon: UserCircle,
        to: '/admin/accounts',
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
    summary,
    accountsQuery.data,
    categoriesQuery.data,
    rolesQuery.data,
    permissionsQuery.data,
  ])

  const shortcuts = [
    { to: '/admin/courses', label: 'Khóa học', desc: 'Tạo và xuất bản khóa học mới', icon: BookOpen },
    { to: '/admin/courses', label: 'Bài học', desc: 'Chương, video và nội dung bài giảng', icon: Video },
    { to: '/admin/courses', label: 'Quiz', desc: 'Câu hỏi trắc nghiệm và điểm đạt', icon: HelpCircle },
    { to: '/admin/categories', label: 'Danh mục', desc: 'Phân loại khóa học trên trang chủ', icon: FolderTree },
    { to: '/admin/users', label: 'Học viên', desc: 'Quản lý tài khoản học viên', icon: Users },
  ]

  return (
    <div ref={containerRef} className="space-y-6">
      <DashboardHero />

      <DashboardMetricsGrid metrics={metrics} ready={contentReady} loading={isLoading} />

      {summary ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardEnrollmentChart data={summary.enrollmentTrend ?? []} ready={contentReady} />
            </div>
            <DashboardCompletionRing
              percent={summary.completionRate}
              quizAttempts={summary.quizAttempts}
              ready={contentReady}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardTopCourses courses={summary.topCourses} />
            <DashboardActivityFeed items={summary.recentActivity} />
          </div>
        </>
      ) : dashboardQuery.isError ? (
        <div className="rounded-2xl border border-dashed border-[#ececec] bg-white px-6 py-10 text-center">
          <p className="text-sm text-[#6b7280]">Không tải được dữ liệu dashboard.</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => void dashboardQuery.refetch()}
          >
            Thử lại
          </Button>
        </div>
      ) : null}

      <DashboardQuickActions actions={shortcuts} />
    </div>
  )
}
