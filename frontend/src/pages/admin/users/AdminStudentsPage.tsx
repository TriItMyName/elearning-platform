import { useQuery } from '@tanstack/react-query'
import { BookOpen, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import {
  AdminCard,
  AdminEmptyRow,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { AdminStudentLearning, AdminStudentOverview } from '@/types/admin-student'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatProgress(value: number | null | undefined) {
  if (value == null) return '—'
  return `${Math.round(value)}%`
}

function ProgressBar({ value }: { value: number | null | undefined }) {
  const percent = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
      <div
        className="h-full rounded-full bg-[#f05123] transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function AdminStudentsPage() {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  const studentsQuery = useQuery({
    queryKey: ['admin', 'students', page, keyword],
    queryFn: () =>
      adminApi.students.list({
        page,
        size: 10,
        keyword: keyword || undefined,
      }),
  })

  const learningQuery = useQuery({
    queryKey: ['admin', 'students', selectedStudentId, 'learning'],
    queryFn: () => adminApi.students.learning(selectedStudentId!),
    enabled: selectedStudentId != null,
  })

  const students = studentsQuery.data?.content ?? []
  const totalPages = studentsQuery.data?.totalPages ?? 0
  const selectedStudent = students.find((student) => student.id === selectedStudentId)

  const closeModal = () => setSelectedStudentId(null)

  return (
    <div>
      <AdminPageHeader
        title="Học viên"
        description="Theo dõi khóa học đã ghi danh và tiến độ học tập của từng học viên."
      />

      <AdminCard className="mb-4" padding>
        <Input
          placeholder="Tìm username, email, họ tên..."
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(0)
            closeModal()
          }}
          className="w-full"
        />
      </AdminCard>

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Người dùng</AdminTh>
                <AdminTh>Email</AdminTh>
                <AdminTh>Khóa đang học</AdminTh>
                <AdminTh>Tiến độ TB</AdminTh>
                <AdminTh>Ghi danh gần nhất</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {studentsQuery.isLoading ? (
                <AdminEmptyRow colSpan={5} message="Đang tải..." />
              ) : students.length === 0 ? (
                <AdminEmptyRow colSpan={5} message="Không tìm thấy học viên." />
              ) : (
                students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onSelect={() => setSelectedStudentId(student.id)}
                  />
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableWrap>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-[#ececec] px-5 py-3.5">
            <p className="text-sm text-[#666]">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </AdminCard>

      <AdminModal
        open={selectedStudentId != null}
        title="Tình trạng học tập"
        description={
          selectedStudent
            ? `${selectedStudent.fullName} (@${selectedStudent.username})`
            : learningQuery.data
              ? `${learningQuery.data.fullName} (@${learningQuery.data.username})`
              : undefined
        }
        onClose={closeModal}
        size="lg"
      >
        {learningQuery.isLoading ? (
          <p className="py-10 text-center text-sm text-[#9ca3af]">Đang tải tiến độ...</p>
        ) : learningQuery.data ? (
          <StudentLearningContent data={learningQuery.data} />
        ) : (
          <p className="py-10 text-center text-sm text-[#9ca3af]">Không tải được dữ liệu học tập.</p>
        )}
      </AdminModal>
    </div>
  )
}

function StudentRow({
  student,
  onSelect,
}: {
  student: AdminStudentOverview
  onSelect: () => void
}) {
  return (
    <AdminTr className="cursor-pointer" onClick={onSelect}>
      <AdminTd>
        <div>
          <p className="font-semibold text-[#111827]">{student.fullName}</p>
          <p className="text-xs text-[#9ca3af]">@{student.username}</p>
        </div>
      </AdminTd>
      <AdminTd className="text-[#6b7280]">{student.email}</AdminTd>
      <AdminTd className="text-[#6b7280]">{student.enrolledCourses}</AdminTd>
      <AdminTd className="font-medium text-[#111827]">{formatProgress(student.averageProgress)}</AdminTd>
      <AdminTd className="text-[#6b7280]">{formatDate(student.lastEnrolledAt)}</AdminTd>
    </AdminTr>
  )
}

function StudentLearningContent({ data }: { data: AdminStudentLearning }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Học viên</p>
        <p className="mt-1 text-sm text-[#6b7280]">{data.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={BookOpen} label="Khóa đang học" value={String(data.enrolledCourses)} />
        <StatCard icon={GraduationCap} label="Tiến độ TB" value={formatProgress(data.averageProgress)} />
      </div>

      {data.enrollments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#e5e7eb] bg-[#fafafa] px-4 py-8 text-center text-sm text-[#6b7280]">
          Học viên chưa ghi danh khóa học nào.
        </p>
      ) : (
        <div className="space-y-3">
          {data.enrollments.map((enrollment) => (
            <div key={enrollment.enrollmentId} className="rounded-xl border border-[#ececec] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/courses/${enrollment.courseSlug}`}
                    className="font-semibold text-[#111827] hover:text-[#f05123]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {enrollment.courseTitle}
                  </Link>
                  <p className="mt-1 text-xs text-[#9ca3af]">Ghi danh {formatDate(enrollment.enrolledAt)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#f05123]">
                  {formatProgress(enrollment.progress)}
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar value={enrollment.progress} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#ececec] bg-[#fafafa] px-3 py-3">
      <div className="flex items-center gap-2 text-[#6b7280]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-[#111827]">{value}</p>
    </div>
  )
}
