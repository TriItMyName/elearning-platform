import {
  BookOpen,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { AppLogo } from '@/components/site/Logo'
import { cn } from '@/lib/utils'
import { getUserInitials } from '@/lib/user'

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Nội dung',
    items: [
      {
        to: '/admin/courses',
        label: 'Khóa học',
        icon: BookOpen,
        hint: 'Chương và bài học',
      },
    ],
  },
  {
    label: 'Cấu hình',
    items: [{ to: '/admin/categories', label: 'Danh mục', icon: FolderTree }],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/users', label: 'Học viên', icon: Users },
      { to: '/admin/accounts', label: 'Tài khoản', icon: UserCircle },
      { to: '/admin/roles', label: 'Vai trò', icon: Shield },
    ],
  },
] as const

export function AdminLayout() {
  const { user, logout, canAccessTeacher } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] text-white">
        <div className="border-b border-[#2a2a2a] px-5 py-5">
          <Link to="/admin" className="inline-flex items-center gap-2.5">
            <AppLogo showTagline={false} />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#888] uppercase">
                Console
              </p>
              <p className="text-sm font-bold text-white">WebLearning</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-[#666] uppercase">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, ...rest }) => {
                  const end = 'end' in rest ? rest.end : false
                  const hint = 'hint' in rest ? rest.hint : undefined

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition',
                          isActive
                            ? 'bg-[#f05123] text-white'
                            : 'text-[#bbb] hover:bg-[#252525] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span>{label}</span>
                            {hint ? (
                              <span
                                className={cn(
                                  'text-[10px] font-normal leading-snug',
                                  isActive ? 'text-white/75' : 'text-[#888]',
                                )}
                              >
                                {hint}
                              </span>
                            ) : null}
                          </span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
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
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#333] px-3 py-2 text-xs font-medium text-[#ccc] transition hover:bg-[#3d3d3d]"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Trang học
            </Link>
            {canAccessTeacher ? (
              <Link
                to="/teacher"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#333] px-3 py-2 text-xs font-medium text-[#ccc] transition hover:bg-[#3d3d3d]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Giảng dạy
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center justify-center rounded-lg bg-[#333] px-3 py-2 text-[#ccc] transition hover:bg-[#3d3d3d]"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        <main className="mx-auto max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
