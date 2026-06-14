import type { ReactNode } from 'react'

interface ContentContainerProps {
  children: ReactNode
  className?: string
}

export function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return <div className={`w-full px-6 lg:px-8 ${className}`}>{children}</div>
}
