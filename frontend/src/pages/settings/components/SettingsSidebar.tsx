import { LayoutDashboard, UserRound } from 'lucide-react'

import type { ProfileResponse } from '@/types/auth'
import { getUserInitials } from '@/lib/user'

export type SettingsTab = 'overview' | 'profile'

const NAV_ITEMS: Array<{
  id: SettingsTab
  label: string
  icon: typeof LayoutDashboard
}> = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserRound },
]

interface SettingsSidebarProps {
  profile: ProfileResponse
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

export function SettingsSidebar({ profile, activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white">
        <div className="h-20 bg-gradient-to-r from-[#f05123] to-[#ff8a5c]" />
        <div className="relative px-5 pb-5">
          <div className="-mt-10 mb-3 flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#fff4f0] text-2xl font-bold text-[#f05123] shadow-md">
                {getUserInitials(profile.fullName)}
              </div>
              <span
                className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  profile.active ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
                title={profile.active ? 'Đang hoạt động' : 'Không hoạt động'}
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#242424]">{profile.fullName}</h2>
            <p className="mt-0.5 text-sm text-[#999]">@{profile.username}</p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                profile.active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {profile.active ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        </div>
      </div>

      <nav className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white p-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-[#fff4f0] text-[#f05123]'
                : 'text-[#666] hover:bg-[#f8f8f8] hover:text-[#292929]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
