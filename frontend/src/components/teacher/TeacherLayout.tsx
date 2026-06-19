import {
  GraduationCap,
  LogOut,
  Shield,
} from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { AppLogo } from '@/components/site/Logo'
import { getUserInitials } from '@/lib/user'

export function TeacherLayout() {
  const { user, logout, canAccessAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link to="/teacher" className="inline-flex min-w-0 items-center gap-2.5">
            <AppLogo showTagline={false} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#888] uppercase">
                Instructor
              </p>
              <p className="truncate text-sm font-bold text-white">WebLearning</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#333] text-[#ccc] transition hover:bg-[#3d3d3d]"
              aria-label="Trang học"
            >
              <GraduationCap className="h-4 w-4" />
            </Link>
            {canAccessAdmin ? (
              <Link
                to="/admin"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#333] text-[#ccc] transition hover:bg-[#3d3d3d]"
                aria-label="Trang quản trị"
              >
                <Shield className="h-4 w-4" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#333] text-[#ccc] transition hover:bg-[#3d3d3d]"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] text-white lg:flex">
        <div className="border-b border-[#2a2a2a] px-5 py-5">
          <Link to="/teacher" className="inline-flex items-center gap-2.5">
            <AppLogo showTagline={false} />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#888] uppercase">
                Instructor
              </p>
              <p className="text-sm font-bold text-white">WebLearning</p>
            </div>
          </Link>
        </div>

        <div className="mt-auto border-t border-[#2a2a2a] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#252525] px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4f0] text-xs font-bold text-[#f05123]">
              {getUserInitials(user?.fullName ?? user?.username ?? '')}
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
            {canAccessAdmin ? (
              <Link
                to="/admin"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#333] px-3 py-2 text-xs font-medium text-[#ccc] transition hover:bg-[#3d3d3d]"
              >
                <Shield className="h-3.5 w-3.5" />
                Quản trị
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

      <div className="min-h-screen lg:ml-64">
        <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
