import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SectionHeadingProps {
  title: ReactNode
  action?: { label: string; to: string }
}

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4">
      <h2 className="text-[24px] font-extrabold leading-[1.6] text-[#242424]">{title}</h2>
      {action ? (
        <Link
          to={action.to}
          className="text-sm font-medium text-[#f05123] hover:underline sm:text-base"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}

