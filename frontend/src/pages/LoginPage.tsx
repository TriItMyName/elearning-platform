import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/auth/auth.context'
import { AppLogo } from '@/components/site/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .max(15, 'Tên đăng nhập tối đa 15 ký tự'),
  password: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .max(20, 'Mật khẩu tối đa 20 ký tự'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      notify.error(getErrorMessage(error, 'Đăng nhập thất bại'))
    }
  })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex justify-center">
        <AppLogo className="h-10" />
      </div>
      <h1 className="text-center text-2xl font-bold text-[#242424]">Đăng nhập</h1>
      <p className="mt-2 text-center text-sm text-[#666]">
        Chào mừng trở lại! Đăng nhập để tiếp tục học.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Tên đăng nhập"
          type="text"
          autoComplete="username"
          placeholder="Nhập tên đăng nhập"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          className="w-full !bg-[#f05123] hover:!bg-[#d93d0f]"
          isLoading={isSubmitting || isLoading}
        >
          Đăng nhập
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[#666]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-[#f05123] hover:underline">
          Đăng ký ngay
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-[#666]">
        <Link to="/" className="text-[#666] hover:text-[#f05123] hover:underline">
          Quay về trang chủ
        </Link>
      </p>
    </div>
  )
}
