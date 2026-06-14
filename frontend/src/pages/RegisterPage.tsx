import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/auth/auth.context'
import { AppLogo } from '@/components/site/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(15, 'Tên đăng nhập tối đa 15 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    fullName: z
      .string()
      .min(3, 'Họ tên tối thiểu 3 ký tự')
      .max(30, 'Họ tên tối đa 30 ký tự'),
    password: z
      .string()
      .min(6, 'Mật khẩu tối thiểu 6 ký tự')
      .max(20, 'Mật khẩu tối đa 20 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...values }) => {
    try {
      await registerUser({ ...values, role: 'STUDENT' })
      navigate('/login', { replace: true })
    } catch (error) {
      notify.error(getErrorMessage(error, 'Đăng ký thất bại'))
    }
  })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex justify-center">
        <AppLogo showTagline={false} />
      </div>
      <h1 className="text-center text-2xl font-bold text-[#292929]">Đăng ký</h1>
      <p className="mt-2 text-center text-sm text-[#666]">
        Tạo tài khoản miễn phí và bắt đầu hành trình học lập trình.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Họ và tên"
          type="text"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Tên đăng nhập"
          type="text"
          autoComplete="username"
          placeholder="3–15 ký tự"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="6–20 ký tự"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          className="w-full !bg-[#f05123] hover:!bg-[#d93d0f]"
          isLoading={isSubmitting || isLoading}
        >
          Đăng ký
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[#666]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-[#f05123] hover:underline">
          Đăng nhập
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
