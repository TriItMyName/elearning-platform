import type { ProfileResponse } from '@/types/auth'

interface SettingsOverviewProps {
  profile: ProfileResponse
}

export function SettingsOverview({ profile }: SettingsOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[#ebebeb] bg-gradient-to-br from-[#fff8f5] via-white to-white p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#f05123]/10 blur-2xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-[#242424] sm:text-3xl">
            Xin chào, {profile.fullName}!
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#666]">
            Thông tin tài khoản được lấy từ hệ thống. Bạn có thể chỉnh sửa họ tên và email ở tab Hồ
            sơ cá nhân.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#ebebeb] bg-white p-6">
        <h3 className="text-base font-bold text-[#242424]">Thông tin tài khoản</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoRow label="ID" value={String(profile.id)} />
          <InfoRow label="Tên đăng nhập" value={profile.username} />
          <InfoRow label="Họ và tên" value={profile.fullName} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Trạng thái" value={profile.active ? 'Hoạt động' : 'Không hoạt động'} />
          <InfoRow label="Ngày tạo" value={formatDateTime(profile.createdAt)} />
          <InfoRow label="Cập nhật lần cuối" value={formatDateTime(profile.updatedAt)} />
        </dl>
      </section>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN')
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fafafa] px-4 py-3">
      <dt className="text-xs text-[#999]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[#292929]">{value}</dd>
    </div>
  )
}
