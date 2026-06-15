import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { ContentContainer } from '@/components/site/ContentContainer'
import { AppLogo } from '@/components/site/Logo'
import { useSearchCourses } from '@/hooks/useCourses'
import { getUserInitials } from '@/lib/user'

export function Header() {
  const { user, isAuthenticated, canAccessAdmin, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { data: searchResults = [] } = useSearchCourses(searchQuery)

  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-[#ebebeb] bg-white">
      <ContentContainer className="grid h-[66px] grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link to="/" className="shrink-0">
          <AppLogo />
        </Link>

        <div className="hidden justify-center md:flex">
          <div className="relative w-full max-w-[380px] lg:max-w-[420px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="h-9 w-full rounded-full border border-[#e8e8e8] bg-[#f8f8f8] pl-10 pr-4 text-sm text-[#292929] outline-none transition focus:border-[#ccc] focus:bg-white"
            />

            {showResults && searchQuery.length >= 2 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[400px] overflow-y-auto rounded-2xl border border-[#e8e8e8] bg-white p-3 shadow-xl">
                {searchResults.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#999]">Không tìm thấy khóa học</p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.slice(0, 6).map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.slug}`}
                        className="block rounded-xl p-2.5 text-sm font-semibold hover:bg-[#f8f8f8]"
                        onClick={() => setShowResults(false)}
                      >
                        {course.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                className="flex items-center gap-2"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4f0] text-sm font-bold text-[#f05123] ring-2 ring-transparent transition hover:ring-[#f05123]">
                  {getUserInitials(user?.fullName ?? user?.username ?? '')}
                </span>
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 top-full z-50 pt-2">
                  <div className="w-44 rounded-xl border border-[#e8e8e8] bg-white py-1 shadow-lg">
                    <p className="border-b border-[#f0f0f0] px-4 py-2 text-sm font-semibold">
                      {user?.fullName}
                    </p>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-[#666] hover:bg-[#f8f8f8]"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Tài khoản
                    </Link>
                    {canAccessAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-[#666] hover:bg-[#f8f8f8]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Quản trị
                      </Link>
                    ) : null}
                    <Link
                      to="/my-courses"
                      className="block px-4 py-2 text-sm text-[#666] hover:bg-[#f8f8f8]"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Khóa học của tôi
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        void logout()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#666] hover:bg-[#f8f8f8]"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[#292929] hover:bg-[#f5f5f5] sm:inline-flex"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-[#f05123] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e0481c] sm:px-5"
              >
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </ContentContainer>
    </header>
  )
}
