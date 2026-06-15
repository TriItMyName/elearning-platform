import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d1d5db] bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4f0] text-[#f05123]">
        <Construction className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-[#111827]">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#6b7280]">{description}</p>
      <span className="mt-6 rounded-md bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-[#6b7280]">
        Đang phát triển
      </span>
    </div>
  )
}
