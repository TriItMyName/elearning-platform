import { ShieldAlert } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { useAdminAccess } from '@/hooks/admin/useAdminAccess'

export function AdminGuard() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const { isChecking, isAdmin, isForbidden } = useAdminAccess()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f05123] border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin || isForbidden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center">
        <ShieldAlert className="h-14 w-14 text-[#f05123]" />
        <h1 className="mt-4 text-2xl font-bold text-[#242424]">Không có quyền truy cập</h1>
        <p className="mt-2 max-w-md text-sm text-[#666]">
          Khu vực quản trị chỉ dành cho tài khoản có vai trò ADMIN.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e0481c]"
        >
          Về trang chủ
        </Link>
      </div>
    )
  }

  return <Outlet />
}
