import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-dark disabled:opacity-60',
  secondary:
    'border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-60',
  ghost: 'text-[#4b5563] hover:bg-[#f3f4f6] disabled:opacity-60',
  danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-60',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 py-1.5 text-xs',
}

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  )
}
