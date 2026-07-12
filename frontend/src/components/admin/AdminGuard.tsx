import { ShieldAlert } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { useAdminAccess } from '@/hooks/admin/useAdminAccess'

export function AdminGuard() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const { isChecking, isAdmin, isTeacher, isForbidden } = useAdminAccess()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#ececec] border-t-[#f05123]" />
      </div>
    )
  }

  if (!isAdmin && isTeacher) {
    return <Navigate to="/teacher" replace />
  }

  if (!isAdmin || isForbidden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4f0] text-[#f05123]">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[#111827]">Không có quyền truy cập</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6b7280]">
          Khu vực quản trị chỉ dành cho tài khoản giảng viên hoặc quản trị viên.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-[#f05123] px-5 text-sm font-semibold text-white transition hover:bg-[#e04820]"
        >
          Về trang chủ
        </Link>
      </div>
    )
  }

  return <Outlet />
}
