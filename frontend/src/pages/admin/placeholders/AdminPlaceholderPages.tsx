import { ComingSoonPage } from '@/components/admin/ComingSoonPage'
import { AdminPageHeader } from '@/components/admin/AdminUi'

export function AdminReportsPage() {
  return (
    <div>
      <AdminPageHeader title="Báo cáo" description="Chưa có API báo cáo — đang chờ backend." />
      <ComingSoonPage
        title="Báo cáo & thống kê"
        description="Dashboard báo cáo học viên, tiến độ học sẽ được bổ sung khi API sẵn sàng."
      />
    </div>
  )
}
