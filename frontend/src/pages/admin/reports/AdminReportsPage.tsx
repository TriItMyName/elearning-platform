import { BarChart3, BookOpen, ClipboardCheck, TrendingUp, Users } from 'lucide-react'

import {
  AdminCard,
  AdminPageHeader,
  AdminStatCard,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from '@/components/admin/AdminUi'
import { useReportsSummary } from '@/hooks/useReports'

export function AdminReportsPage() {
  const { data, isLoading } = useReportsSummary()

  return (
    <div>
      <AdminPageHeader
        title="Báo cáo & thống kê"
        description="Dữ liệu mock mặc định. Khi BE có GET /api/admin/reports/summary, set VITE_MOCK_REPORTS=false."
      />

      {isLoading ? (
        <p className="text-sm text-[#9ca3af]">Đang tải báo cáo...</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Học viên" value={data.totalStudents} icon={Users} to="/admin/users" />
            <AdminStatCard label="Khóa học" value={data.totalCourses} icon={BookOpen} to="/admin/courses" />
            <AdminStatCard label="Đăng ký đang học" value={data.activeEnrollments} icon={TrendingUp} to="/admin/courses" />
            <AdminStatCard label="Tỷ lệ hoàn thành" value={`${data.completionRate}%`} icon={BarChart3} to="/admin/reports" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminCard padding>
              <h2 className="text-base font-bold text-[#111827]">Hoạt động gần đây</h2>
              <ul className="mt-4 space-y-3">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="rounded-lg border border-[#ececec] px-3 py-2.5 text-sm">
                    <p className="text-[#374151]">{item.message}</p>
                    <p className="mt-1 text-xs text-[#9ca3af]">
                      {new Date(item.at).toLocaleString('vi-VN')} · {item.type}
                    </p>
                  </li>
                ))}
              </ul>
            </AdminCard>

            <AdminCard padding>
              <h2 className="text-base font-bold text-[#111827]">Khóa học nổi bật</h2>
              <AdminTableWrap>
                <AdminTable>
                  <AdminTableHead>
                    <tr>
                      <AdminTh>Khóa học</AdminTh>
                      <AdminTh>Đăng ký</AdminTh>
                      <AdminTh>Hoàn thành</AdminTh>
                    </tr>
                  </AdminTableHead>
                  <AdminTableBody>
                    {data.topCourses.map((c) => (
                      <AdminTr key={c.courseId}>
                        <AdminTd className="font-medium">{c.title}</AdminTd>
                        <AdminTd>{c.enrollments}</AdminTd>
                        <AdminTd>{c.completionRate}%</AdminTd>
                      </AdminTr>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              </AdminTableWrap>
              <div className="mt-4 flex gap-4 text-sm text-[#6b7280]">
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4" /> {data.quizAttempts} lượt làm quiz
                </span>
                <span>{data.assignmentSubmissions} bài nộp</span>
              </div>
            </AdminCard>
          </div>
        </div>
      ) : null}
    </div>
  )
}
