import { GraduationCap } from 'lucide-react'

export function AppLogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-[#fff4f0] text-[#f05123] ${className}`}
    >
      <GraduationCap className="h-[55%] w-[55%]" strokeWidth={2.25} />
    </span>
  )
}

export function AppLogo({
  showTagline = true,
  className = '',
}: {
  showTagline?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <AppLogoMark className="h-9 w-9 sm:h-10 sm:w-10" />
      {showTagline ? (
        <span className="hidden text-[13px] font-extrabold uppercase leading-[1.2] tracking-wide text-[#292929] md:block">
          WebLearning
        </span>
      ) : null}
    </div>
  )
}

export function BookIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
