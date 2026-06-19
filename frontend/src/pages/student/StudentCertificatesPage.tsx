import { Award, Loader2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CertificatePreview } from '@/components/certificate/CertificatePreview'
import { Button } from '@/components/ui/Button'
import {
  useCertificates,
  useClaimCertificate,
  useDownloadCertificatePdf,
  useEligibleCertificateCourses,
} from '@/hooks/useCertificates'
import { useAuth } from '@/auth/auth.context'
import { downloadBlob } from '@/lib/download-blob'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import type { Certificate } from '@/types/certificate'

function slugifyFilename(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const downloadMutation = useDownloadCertificatePdf()

  const handleDownload = () => {
    downloadMutation.mutate(certificate, {
      onSuccess: ({ blob, certificate: item }) => {
        const filename = `chung-chi-${slugifyFilename(item.courseTitle) || item.courseId}.pdf`
        downloadBlob(blob, filename)
        notify.success('Đã tải chứng chỉ PDF')
      },
      onError: (error) => notify.error(getErrorMessage(error)),
    })
  }

  return (
    <CertificatePreview
      certificate={certificate}
      onDownload={handleDownload}
      isDownloading={downloadMutation.isPending}
    />
  )
}

function EligibleCourseCard({
  courseTitle,
  courseSlug,
  onClaim,
  isClaiming,
}: {
  courseTitle: string
  courseSlug: string
  onClaim: () => void
  isClaiming: boolean
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f05123]/35 bg-[#fffaf8] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ec] text-[#f05123]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f05123]">Sẵn sàng nhận</p>
          <h3 className="mt-1 text-base font-bold text-[#111827]">{courseTitle}</h3>
          <p className="mt-1 text-sm text-[#6b7280]">Bạn đã hoàn thành 100% khóa học này.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onClaim} disabled={isClaiming}>
              {isClaiming ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Nhận chứng chỉ
            </Button>
            <Link
              to={`/learn/${courseSlug}`}
              className="inline-flex h-10 items-center rounded-lg border border-[#e8e8e8] bg-white px-4 text-sm font-semibold text-[#374151] hover:bg-[#fafafa]"
            >
              Ôn lại bài học
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentCertificatesPage() {
  const { isAuthenticated } = useAuth()
  const certificatesQuery = useCertificates(isAuthenticated)
  const { eligibleCourses, isLoading: eligibleLoading } = useEligibleCertificateCourses(isAuthenticated)
  const claimMutation = useClaimCertificate()

  const certificates = certificatesQuery.data ?? []
  const certificateCourseIds = new Set(certificates.map((item) => item.courseId))
  const pendingEligible = eligibleCourses.filter((course) => !certificateCourseIds.has(course.courseId))

  const handleClaim = (courseId: number) => {
    claimMutation.mutate(courseId, {
      onSuccess: () => notify.success('Đã cấp chứng chỉ cho khóa học'),
      onError: (error) => notify.error(getErrorMessage(error)),
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto my-8 max-w-md rounded-2xl border border-[#e8e8e8] bg-[#fafafa] px-6 py-10 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0eb] text-[#f05123]">
          <Award className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#242424]">Đăng nhập để xem chứng chỉ</h1>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          Nhận và tải chứng chỉ PDF sau khi hoàn thành khóa học.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-[#f05123] px-4 text-sm font-semibold text-white hover:bg-[#e04a1f]"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  const isLoading = certificatesQuery.isLoading || eligibleLoading

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-4 sm:px-6 sm:py-6 lg:px-0">
      <header className="border-b border-[#ececec] pb-4 sm:pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f05123]">Thành tích</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#242424]">Chứng chỉ của tôi</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Xem và tải chứng chỉ PDF khi bạn hoàn thành khóa học.
        </p>
      </header>

      {isLoading ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-[#6b7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#f05123]" />
          <p className="text-sm">Đang tải chứng chỉ...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {pendingEligible.length > 0 ? (
            <section>
              <h2 className="text-base font-bold text-[#242424]">Khóa học đủ điều kiện</h2>
              <p className="mt-1 text-sm text-[#6b7280]">
                Các khóa bạn đã hoàn thành 100% và có thể nhận chứng chỉ ngay.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {pendingEligible.map((course) => (
                  <EligibleCourseCard
                    key={course.courseId}
                    courseTitle={course.courseTitle}
                    courseSlug={course.courseSlug}
                    onClaim={() => handleClaim(course.courseId)}
                    isClaiming={claimMutation.isPending && claimMutation.variables === course.courseId}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#242424]">Chứng chỉ đã cấp</h2>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {certificates.length > 0
                    ? `${certificates.length} chứng chỉ đã được cấp cho bạn.`
                    : 'Chưa có chứng chỉ nào.'}
                </p>
              </div>
              {/* <Link
                to="/my-progress"
                className="text-sm font-semibold text-[#f05123] hover:text-[#d9481e]"
              >
                Xem tiến độ
              </Link> */}
            </div>

            {certificates.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#d9dde3] bg-[#fafafa] px-5 py-10 text-center">
                <p className="text-sm font-semibold text-[#374151]">
                  Hoàn thành khóa học để nhận chứng chỉ PDF.
                </p>
                <Link
                  to="/my-courses"
                  className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#f05123] px-4 text-sm font-semibold text-white hover:bg-[#e04a1f]"
                >
                  Về khóa học của tôi
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4 sm:space-y-5 md:space-y-6">
                {certificates.map((certificate) => (
                  <CertificateCard key={certificate.id} certificate={certificate} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
