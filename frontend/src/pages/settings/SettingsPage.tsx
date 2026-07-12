import { Settings } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/auth/auth.context'
import { useProfileQuery } from '@/hooks/useProfile'

import { SettingsOverview } from './components/SettingsOverview'
import { SettingsProfileForm } from './components/SettingsProfileForm'
import { SettingsSidebar, type SettingsTab } from './components/SettingsSidebar'

const TAB_TITLES: Record<SettingsTab, { title: string; description: string }> = {
  overview: {
    title: 'Tổng quan',
    description: 'Xem thông tin tài khoản từ hệ thống.',
  },
  profile: {
    title: 'Hồ sơ cá nhân',
    description: 'Cập nhật họ tên và email.',
  },
}

const VALID_TABS: SettingsTab[] = ['overview', 'profile']

function isValidTab(value: string | null): value is SettingsTab {
  return VALID_TABS.includes(value as SettingsTab)
}

export function SettingsPage() {
  const { isAuthenticated, syncUser, isLoading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    isValidTab(tabParam) ? tabParam : 'overview',
  )

  const { data: profile, isLoading, isError } = useProfileQuery(isAuthenticated && !authLoading)

  useEffect(() => {
    if (isValidTab(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = useCallback(
    (tab: SettingsTab) => {
      setActiveTab(tab)
      setSearchParams({ tab }, { replace: true })
    },
    [setSearchParams],
  )

  const handleProfileUpdated = useCallback(() => {
    syncUser()
  }, [syncUser])

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <Settings className="mx-auto h-12 w-12 text-[#ccc]" />
        <h1 className="mt-4 text-xl font-bold text-[#242424]">Đăng nhập để quản lý tài khoản</h1>
        <p className="mt-2 text-sm text-[#666]">Bạn cần đăng nhập để xem và chỉnh sửa hồ sơ.</p>
        <Link
          to="/login"
          state={{ from: '/settings' }}
          className="mt-6 inline-flex rounded-full bg-[#f05123] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e0481c]"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (authLoading || isLoading) {
    return <SettingsPageSkeleton />
  }

  if (isError || !profile) {
    return <Navigate to="/login" state={{ from: '/settings' }} replace />
  }

  const { title, description } = TAB_TITLES[activeTab]

  return (
    <div className="pb-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#f05123]">
          Trung tâm tài khoản
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#242424] sm:text-3xl">Tài khoản của tôi</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666]">
          Quản lý thông tin tài khoản của bạn.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {VALID_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-[#f05123] text-white'
                : 'bg-[#f5f5f5] text-[#666] hover:bg-[#ebebeb]'
            }`}
          >
            {TAB_TITLES[tab].title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <SettingsSidebar
          profile={profile}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="min-w-0">
          <div className="mb-6 rounded-2xl border border-[#ebebeb] bg-white px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-[#242424]">{title}</h2>
            <p className="mt-1 text-sm text-[#666]">{description}</p>
          </div>

          {activeTab === 'overview' ? <SettingsOverview profile={profile} /> : null}
          {activeTab === 'profile' ? (
            <SettingsProfileForm profile={profile} onProfileUpdated={handleProfileUpdated} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function SettingsPageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 pb-10">
      <div className="h-8 w-48 rounded-lg bg-gray-200" />
      <div className="h-4 w-72 rounded bg-gray-100" />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-80 rounded-2xl bg-gray-200" />
        <div className="space-y-4">
          <div className="h-16 rounded-2xl bg-gray-100" />
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
