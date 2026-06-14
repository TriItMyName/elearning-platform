import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUpdateProfile } from '@/hooks/useProfile'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { ProfileResponse } from '@/types/auth'

const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  email: z.string().email('Email không hợp lệ').max(100, 'Email tối đa 100 ký tự'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface SettingsProfileFormProps {
  profile: ProfileResponse
  onProfileUpdated?: () => void
}

export function SettingsProfileForm({ profile, onProfileUpdated }: SettingsProfileFormProps) {
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email,
    },
  })

  useEffect(() => {
    reset({ fullName: profile.fullName, email: profile.email })
  }, [profile, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values)
      onProfileUpdated?.()
      notify.success('Cập nhật hồ sơ thành công')
      reset(values)
    } catch (error) {
      notify.error(getErrorMessage(error, 'Cập nhật hồ sơ thất bại'))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <section className="rounded-2xl border border-[#ebebeb] bg-white p-6">
        <div className="flex items-start gap-4 border-b border-[#f0f0f0] pb-5">
          <div className="rounded-xl bg-[#fff4f0] p-2.5 text-[#f05123]">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242424]">Chỉnh sửa hồ sơ</h3>
            <p className="mt-1 text-sm text-[#666]">
              Chỉ họ tên và email có thể cập nhật qua API.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="rounded-xl bg-[#fafafa] px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[#666]">
              <AtSign className="h-4 w-4 text-[#999]" />
              Tên đăng nhập
            </label>
            <p className="mt-1 text-sm font-semibold text-[#292929]">{profile.username}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#999]">
          {isDirty ? 'Bạn có thay đổi chưa lưu' : 'Tất cả thay đổi đã được lưu'}
        </p>
        <Button
          type="submit"
          disabled={!isDirty}
          isLoading={isSubmitting || updateProfile.isPending}
          className="!bg-[#f05123] hover:!bg-[#d93d0f] sm:min-w-[160px]"
        >
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}
