import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0e0e0] bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4f0] text-[#f05123]">
        <Construction className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-[#242424]">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#666]">{description}</p>
      <span className="mt-6 rounded-full bg-[#f5f5f5] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#999]">
        Coming soon
      </span>
    </div>
  )
}
