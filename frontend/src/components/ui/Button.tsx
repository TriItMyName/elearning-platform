import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:opacity-60',
  secondary: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-60',
  ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-60',
}

export function Button({
  variant = 'primary',
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
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  )
}
