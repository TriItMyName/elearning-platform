import {
  BarChart3,
  BookOpen,
  FolderTree,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
  Users,
  Video,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { AppLogo } from '@/components/site/Logo'
import { getUserInitials } from '@/lib/user'

const NAV_ITEMS: Array<{
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  soon?: boolean
}> = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Học viên', icon: Users },
  { to: '/admin/accounts', label: 'Tài khoản', icon: UserCircle },
  { to: '/admin/courses', label: 'Khóa học', icon: BookOpen },
  { to: '/admin/lessons', label: 'Bài học', icon: Video },
  { to: '/admin/quizzes', label: 'Quiz', icon: HelpCircle },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/roles', label: 'Vai trò', icon: Shield },
  { to: '/admin/permissions', label: 'Quyền hạn', icon: Shield },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3, soon: true },
]

export function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] text-white">
        <div className="border-b border-[#2a2a2a] px-5 py-5">
          <Link to="/admin" className="inline-flex items-center gap-2">
            <AppLogo showTagline={false} />
            <span className="text-sm font-bold uppercase tracking-wide">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, soon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-[#f05123] text-white'
                    : 'text-[#bbb] hover:bg-[#252525] hover:text-white',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {soon ? (
                <span className="rounded bg-[#333] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#999]">
                  Soon
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#2a2a2a] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#252525] px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4f0] text-xs font-bold text-[#f05123]">
              {getUserInitials(user?.fullName ?? '')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.fullName}</p>
              <p className="truncate text-xs text-[#888]">@{user?.username}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#333] px-3 py-2 text-xs font-medium text-[#ccc] hover:bg-[#3d3d3d]"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Trang học
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center justify-center rounded-lg bg-[#333] px-3 py-2 text-[#ccc] hover:bg-[#3d3d3d]"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
