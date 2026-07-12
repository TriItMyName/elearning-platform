import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { AppLogoMark } from '@/components/site/Logo'
import { getUserInitials } from '@/lib/user'

export type LearnLayoutContext = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function LearnLayout() {
  const { slug = '' } = useParams()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#1a1a1a] text-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#bbb] hover:bg-[#252525] lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu bài học"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="hidden items-center gap-2 sm:flex">
              <AppLogoMark className="h-8 w-8" />
              <span className="text-sm font-bold text-white">WebLearning</span>
            </Link>
            <Link to={`/courses/${slug}`} className="text-sm text-[#bbb] hover:text-white sm:ml-2">
              ← Khóa học
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/my-courses" className="hidden text-sm text-[#bbb] hover:text-white sm:inline">
              Khóa của tôi
            </Link>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4f0] text-xs font-bold text-[#f05123]">
              {getUserInitials(user?.fullName ?? '')}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#bbb] hover:bg-[#252525]"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <Outlet context={{ sidebarOpen: menuOpen, setSidebarOpen: setMenuOpen }} />
    </div>
  )
}
