import { Download, Loader2, Medal } from 'lucide-react'

import type { Certificate } from '@/types/certificate'

const CERTIFICATE_SEAL_SRC = '/images/certificate-seal.png'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface CertificatePreviewProps {
  certificate: Certificate
  onDownload?: () => void
  isDownloading?: boolean
}

export function CertificatePreview({
  certificate,
  onDownload,
  isDownloading = false,
}: CertificatePreviewProps) {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-xl border-2 border-[#a43700] bg-[#f8fafb] px-4 py-5 shadow-lg sm:flex sm:aspect-[1.414/1] sm:max-w-2xl sm:flex-col sm:justify-between sm:px-6 sm:py-6 md:max-w-3xl md:px-8 md:py-8 lg:px-10 lg:py-9"
    >
        <div
          data-pdf-decoration
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(164,55,0,0.05)_0%,transparent_40%),radial-gradient(circle_at_0%_100%,rgba(164,55,0,0.03)_0%,transparent_40%)]"
        />

        <div
          data-pdf-decoration
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ffdbcf] opacity-10 blur-3xl sm:-right-16 sm:-top-16 sm:h-48 sm:w-48"
        />
        <div
          data-pdf-decoration
          className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#ffe088] opacity-5 blur-3xl sm:-bottom-24 sm:-left-24 sm:h-64 sm:w-64"
        />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute -left-1 top-0 h-14 w-[4.5rem] bg-contain bg-left-top bg-no-repeat opacity-85 sm:-left-2 sm:-top-1 sm:h-24 sm:w-32 sm:opacity-90 md:h-28 md:w-36"
            style={{ backgroundImage: `url(${CERTIFICATE_SEAL_SRC})` }}
          />

          <div
            className="absolute left-1/2 top-[42%] hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-[0.06] sm:block md:h-52 md:w-52"
            style={{ backgroundImage: `url(${CERTIFICATE_SEAL_SRC})` }}
          />

          <div className="absolute bottom-4 right-6 hidden select-none opacity-[0.05] sm:block md:right-14">
            <span className="block rotate-[-15deg] text-4xl font-bold tracking-tight text-[#a43700] md:text-5xl">
              WebLearning
            </span>
          </div>
        </div>

        {onDownload ? (
        <button
          type="button"
          onClick={onDownload}
            disabled={isDownloading}
            aria-label="Tải PDF"
            className="absolute right-2 top-2 z-20 inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#a43700]/25 bg-white/55 px-2 py-1.5 text-xs font-bold text-[#a43700] shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-white/75 disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:min-h-10 sm:min-w-fit sm:px-3 sm:py-2 sm:text-sm md:right-4 md:top-4"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Tải PDF</span>
          </button>
        ) : null}

        <div className="relative z-10 flex w-full flex-col gap-2 pt-10 text-center sm:flex-1 sm:justify-between sm:pt-2">
          <div className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-5">
            <div className="flex flex-col items-center">
              <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#cd4700] sm:mb-2 sm:h-9 sm:w-9 md:h-10 md:w-10">
                <Medal className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a43700] sm:text-[10px] md:text-xs">
                WebLearning
              </span>
            </div>

            <div className="space-y-1 px-1 sm:space-y-1.5">
              <h3 className="text-base font-bold uppercase leading-tight tracking-tight text-[#a43700] sm:text-lg md:text-xl lg:text-2xl">
                Chứng nhận hoàn thành
              </h3>
              <p className="mx-auto max-w-md text-[11px] leading-relaxed text-[#546067] sm:text-xs md:text-sm">
                Chứng nhận học viên đã hoàn thành khóa học
              </p>
            </div>

            <div className="w-full space-y-1.5 sm:space-y-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8f7066] sm:text-[10px] md:text-xs">
                Trao tặng cho
              </p>
              <p className="mx-auto max-w-full break-words border-b-2 border-[#e3bfb2]/30 px-3 py-1 text-lg font-bold leading-snug tracking-tight text-[#191c1d] sm:px-6 sm:py-1.5 sm:text-xl md:text-2xl lg:text-3xl">
                {certificate.studentName}
              </p>
              <p className="px-1 pt-1 text-[11px] leading-relaxed text-[#5a4138] sm:pt-2 sm:text-xs md:text-sm">
                Đã hoàn thành xuất sắc chương trình đào tạo
              </p>
              <p className="break-words px-1 text-sm font-bold italic leading-snug text-[#a43700] sm:text-base md:text-lg">
                {certificate.courseTitle}
              </p>
            </div>
          </div>

          <div className="mt-4 grid w-full grid-cols-1 gap-2 border-t border-[#e3bfb2]/40 pt-4 sm:mt-0 sm:grid-cols-3 sm:gap-3 sm:pt-5 md:gap-4 md:pt-6">
            <PreviewMeta label="Giảng viên" value={certificate.instructorName ?? '—'} />
            <PreviewMeta label="Ngày cấp" value={formatDate(certificate.issuedAt)} />
            <PreviewMeta label="Mã chứng chỉ" value={certificate.certificateCode} mono />
          </div>
      </div>
    </div>
  )
}

function PreviewMeta({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg border border-[#e3bfb2]/20 bg-[#f2f4f5] p-2.5 text-left sm:p-3 md:p-3.5">
      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#546067] sm:mb-1 sm:text-[10px] md:text-xs">
        {label}
      </p>
      <p
        className={`break-words font-bold text-[#191c1d] ${mono ? 'font-mono text-[10px] sm:text-[11px] md:text-xs' : 'text-[11px] sm:text-xs md:text-sm'}`}
      >
        {value}
      </p>
    </div>
  )
}
