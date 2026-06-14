import { useQuery } from '@tanstack/react-query'
import { BookOpen, FolderTree, HelpCircle, Shield, Users, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import { coursesApi } from '@/api/courses.api'
import { AdminCard, AdminPageHeader } from '@/components/admin/AdminUi'

export function AdminDashboardPage() {
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => adminApi.users.list({ page: 0, size: 1 }),
  })
  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminApi.roles.list(),
  })
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.categories.list(),
  })
  const permissionsQuery = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminApi.permissions.list(),
  })
  const coursesQuery = useQuery({
    queryKey: ['courses', 'dashboard'],
    queryFn: () => coursesApi.list({ page: 0, size: 1 }),
  })

  const stats = [
    {
      label: 'Học viên',
      value: usersQuery.data?.totalElements ?? '—',
      icon: Users,
      to: '/admin/users',
      color: 'text-[#f05123] bg-[#fff4f0]',
    },
    {
      label: 'Khóa học',
      value: coursesQuery.data?.totalElements ?? '—',
      icon: BookOpen,
      to: '/admin/courses',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Danh mục',
      value: categoriesQuery.data?.length ?? '—',
      icon: FolderTree,
      to: '/admin/categories',
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Vai trò',
      value: rolesQuery.data?.length ?? '—',
      icon: Shield,
      to: '/admin/roles',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Quyền hạn',
      value: permissionsQuery.data?.length ?? '—',
      icon: Shield,
      to: '/admin/permissions',
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Tổng quan"
        description="Quản trị hệ thống e-learning WebLearning."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link key={label} to={to}>
            <AdminCard className="p-5 transition hover:border-[#f05123]/30 hover:shadow-md">
              <div className={`inline-flex rounded-xl p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#999]">
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold text-[#242424]">{value}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <AdminCard className="mt-6 p-6">
        <h2 className="text-base font-bold text-[#242424]">Quản lý nội dung</h2>
        <p className="mt-1 text-sm text-[#666]">
          Tạo khóa học, chương, bài học, quiz và bài tập qua các module bên dưới.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/admin/courses', label: 'Khóa học', icon: BookOpen },
            { to: '/admin/lessons', label: 'Bài học', icon: Video },
            { to: '/admin/quizzes', label: 'Quiz', icon: HelpCircle },
            { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-sm font-medium text-[#444] hover:border-[#f05123]/30 hover:text-[#f05123]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}
