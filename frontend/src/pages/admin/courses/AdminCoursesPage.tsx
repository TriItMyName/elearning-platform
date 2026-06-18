import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/admin.api'
import {
  AdminCard,
  AdminEmptyRow,
  AdminIconButton,
  AdminModal,
  AdminModalFooter,
  AdminNativeSelect,
  AdminPageHeader,
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableWrap,
  AdminTd,
  AdminTextarea,
  AdminTh,
  AdminTr,
} from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import type { AdminUser } from '@/types/admin'
import type { AdminCourse, AdminCourseStatus } from '@/types/admin-course'
import {
  ADMIN_COURSE_STATUS_LABEL,
  ADMIN_COURSE_STATUS_OPTIONS,
} from '@/types/admin-course'

type CourseTab = 'active' | 'deleted'

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CourseStatusBadge({ status }: { status: AdminCourseStatus }) {
  const styles: Record<AdminCourseStatus, string> = {
    DRAFT: 'bg-[#f3f4f6] text-[#4b5563]',
    PUBLISHED: 'bg-[#ecfdf5] text-[#047857]',
    ARCHIVED: 'bg-[#fffbeb] text-[#b45309]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
        styles[status],
      )}
    >
      {ADMIN_COURSE_STATUS_LABEL[status]}
    </span>
  )
}

export function AdminCoursesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<CourseTab>('active')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminCourse | null>(null)

  const activeQuery = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminApi.courses.list(),
  })

  const deletedQuery = useQuery({
    queryKey: ['admin', 'courses', 'deleted'],
    queryFn: () => adminApi.courses.listDeleted(),
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.categories.list(),
  })

  const instructorsQuery = useQuery({
    queryKey: ['admin', 'users', 'instructors'],
    queryFn: () => adminApi.users.list({ page: 0, size: 200, role: 'TEACHER' }),
  })

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of categoriesQuery.data ?? []) {
      map.set(c.id, c.name)
    }
    return map
  }, [categoriesQuery.data])

  const instructorMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const u of instructorsQuery.data?.content ?? []) {
      map.set(u.id, u.fullName || u.username)
    }
    return map
  }, [instructorsQuery.data])

  const rawItems = tab === 'active' ? (activeQuery.data ?? []) : (deletedQuery.data ?? [])
  const isLoading = tab === 'active' ? activeQuery.isLoading : deletedQuery.isLoading

  const items = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return rawItems.filter((item) => {
      if (statusFilter && item.adminStatus !== statusFilter) return false
      if (categoryFilter && item.categoryId !== categoryFilter) return false
      if (!q) return true
      const categoryName = categoryMap.get(item.categoryId)?.toLowerCase() ?? ''
      const instructorName = instructorMap.get(item.instructorId)?.toLowerCase() ?? ''
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        categoryName.includes(q) ||
        instructorName.includes(q)
      )
    })
  }, [rawItems, keyword, statusFilter, categoryFilter, categoryMap, instructorMap])

  const invalidateCourses = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'deleted'] })
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.courses.delete(id),
    onSuccess: () => {
      notify.success('Đã chuyển khóa học vào thùng rác')
      invalidateCourses()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => adminApi.courses.restore(id),
    onSuccess: () => {
      notify.success('Khôi phục khóa học thành công')
      invalidateCourses()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const activeCount = activeQuery.data?.length ?? 0
  const deletedCount = deletedQuery.data?.length ?? 0

  return (
    <div>
      <AdminPageHeader
        title="Khóa học"
        description="Tạo, chỉnh sửa, xuất bản và quản lý khóa học trên nền tảng."
        action={
          tab === 'active' ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm khóa học
            </Button>
          ) : undefined
        }
      />

      <AdminCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#f0f0f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg bg-[#f9fafb] p-1">
            <button
              type="button"
              onClick={() => setTab('active')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'active'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#374151]',
              )}
            >
              Đang hoạt động
              {activeCount > 0 ? (
                <span className="ml-1.5 text-xs text-[#9ca3af]">({activeCount})</span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setTab('deleted')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'deleted'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6b7280] hover:text-[#374151]',
              )}
            >
              Thùng rác
              {deletedCount > 0 ? (
                <span className="ml-1.5 text-xs text-[#9ca3af]">({deletedCount})</span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tiêu đề, slug, danh mục..."
                className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#f05123] focus:outline-none focus:ring-1 focus:ring-[#f05123]"
              />
            </div>
            {tab === 'active' ? (
              <AdminNativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AdminCourseStatus | '')}
                className="h-9 min-w-[140px]"
              >
                <option value="">Mọi trạng thái</option>
                {ADMIN_COURSE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminNativeSelect>
            ) : null}
            <AdminNativeSelect
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value ? Number(e.target.value) : '')
              }
              className="h-9 min-w-[140px]"
            >
              <option value="">Mọi danh mục</option>
              {(categoriesQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminNativeSelect>
          </div>
        </div>

        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Tiêu đề</AdminTh>
                <AdminTh>Slug</AdminTh>
                <AdminTh>Danh mục</AdminTh>
                <AdminTh>Giảng viên</AdminTh>
                {tab === 'active' ? <AdminTh>Trạng thái</AdminTh> : null}
                <AdminTh>Cập nhật</AdminTh>
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {isLoading ? (
                <AdminEmptyRow colSpan={tab === 'active' ? 7 : 6} message="Đang tải..." />
              ) : items.length === 0 ? (
                <AdminEmptyRow
                  colSpan={tab === 'active' ? 7 : 6}
                  message={
                    tab === 'active'
                      ? keyword || statusFilter || categoryFilter
                        ? 'Không tìm thấy khóa học phù hợp.'
                        : 'Chưa có khóa học nào.'
                      : 'Thùng rác trống.'
                  }
                />
              ) : (
                items.map((item) => (
                  <AdminTr key={item.id}>
                    <AdminTd className="max-w-[220px] font-semibold text-[#111827]">
                      <span className="line-clamp-2">{item.title}</span>
                    </AdminTd>
                    <AdminTd className="font-mono text-xs text-[#6b7280]">{item.slug}</AdminTd>
                    <AdminTd className="text-[#6b7280]">
                      {categoryMap.get(item.categoryId) ?? `#${item.categoryId}`}
                    </AdminTd>
                    <AdminTd className="text-[#6b7280]">
                      {instructorMap.get(item.instructorId) ?? `#${item.instructorId}`}
                    </AdminTd>
                    {tab === 'active' ? (
                      <AdminTd>
                        <CourseStatusBadge status={item.adminStatus} />
                      </AdminTd>
                    ) : null}
                    <AdminTd className="whitespace-nowrap text-xs text-[#9ca3af]">
                      {formatDateTime(item.updatedAt)}
                    </AdminTd>
                    <AdminTd align="right">
                      <div className="flex justify-end gap-0.5">
                        {tab === 'active' ? (
                          <>
                            <Link
                              to="/admin/lessons"
                              title="Quản lý bài học"
                              aria-label="Quản lý bài học"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#111827]"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Link>
                            <AdminIconButton title="Sửa" onClick={() => setEditItem(item)}>
                              <Pencil className="h-4 w-4" />
                            </AdminIconButton>
                            <AdminIconButton
                              title="Xóa"
                              variant="danger"
                              onClick={async () => {
                                const ok = await confirm({
                                  title: 'Chuyển vào thùng rác',
                                  description: `Khóa học "${item.title}" sẽ được ẩn khỏi danh sách hoạt động. Bạn có thể khôi phục sau trong tab Thùng rác.`,
                                  confirmLabel: 'Chuyển vào thùng rác',
                                })
                                if (ok) deleteMutation.mutate(item.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </AdminIconButton>
                          </>
                        ) : (
                          <AdminIconButton
                            title="Khôi phục"
                            onClick={async () => {
                              const ok = await confirm({
                                title: 'Khôi phục khóa học',
                                description: `Khôi phục "${item.title}" về danh sách đang hoạt động?`,
                                confirmLabel: 'Khôi phục',
                              })
                              if (ok) restoreMutation.mutate(item.id)
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </AdminIconButton>
                        )}
                      </div>
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableWrap>
      </AdminCard>

      <CourseFormModal
        open={createOpen}
        title="Thêm khóa học"
        onClose={() => setCreateOpen(false)}
        mode="create"
        categories={categoriesQuery.data ?? []}
        instructors={instructorsQuery.data?.content ?? []}
      />
      {editItem ? (
        <CourseFormModal
          open
          title={`Sửa: ${editItem.title}`}
          onClose={() => setEditItem(null)}
          mode="edit"
          initial={editItem}
          categories={categoriesQuery.data ?? []}
          instructors={instructorsQuery.data?.content ?? []}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function CourseFormModal({
  open,
  title,
  onClose,
  mode,
  initial,
  categories,
  instructors,
}: {
  open: boolean
  title: string
  onClose: () => void
  mode: 'create' | 'edit'
  initial?: AdminCourse
  categories: { id: number; name: string }[]
  instructors: AdminUser[]
}) {
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    categoryId: initial?.categoryId ?? 0,
    instructorId: initial?.instructorId ?? 0,
    adminStatus: (initial?.adminStatus ?? 'DRAFT') as AdminCourseStatus,
  })

  useEffect(() => {
    if (!open) return
    setForm({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? 0,
      instructorId: initial?.instructorId ?? 0,
      adminStatus: initial?.adminStatus ?? 'DRAFT',
    })
  }, [open, initial])

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'create') {
        return adminApi.courses.create({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          categoryId: form.categoryId,
          instructorId: form.instructorId,
          adminStatus: form.adminStatus,
        })
      }
      return adminApi.courses.update(initial!.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId,
        instructorId: form.instructorId,
        adminStatus: form.adminStatus,
      })
    },
    onSuccess: () => {
      notify.success(mode === 'create' ? 'Tạo khóa học thành công' : 'Cập nhật khóa học thành công')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses', 'deleted'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const canSubmit =
    form.title.trim().length > 0 && form.categoryId > 0 && form.instructorId > 0

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <AdminModalFooter
          onCancel={onClose}
          onSubmit={() => mutation.mutate()}
          isLoading={mutation.isPending}
          submitDisabled={!canSubmit}
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="VD: Lập trình JavaScript cơ bản"
        />
        {mode === 'edit' && initial ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Slug</label>
            <p className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 font-mono text-sm text-[#6b7280]">
              {initial.slug}
            </p>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Slug tự động cập nhật khi đổi tiêu đề (do hệ thống tạo).
            </p>
          </div>
        ) : (
          <p className="rounded-lg bg-[#f9fafb] px-3 py-2 text-xs text-[#6b7280]">
            Slug URL sẽ được hệ thống tự tạo từ tiêu đề khi lưu.
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Danh mục</label>
          <AdminNativeSelect
            value={form.categoryId || ''}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Giảng viên</label>
          <AdminNativeSelect
            value={form.instructorId || ''}
            onChange={(e) => setForm({ ...form, instructorId: Number(e.target.value) })}
          >
            <option value="">Chọn giảng viên</option>
            {instructors.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username}
                {u.email ? ` (${u.email})` : ''}
              </option>
            ))}
          </AdminNativeSelect>
          {instructors.length === 0 ? (
            <p className="mt-1 text-xs text-[#b45309]">
              Chưa có tài khoản TEACHER. Tạo tài khoản giảng viên trước khi gán khóa học.
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Trạng thái quản trị</label>
          <AdminNativeSelect
            value={form.adminStatus}
            onChange={(e) =>
              setForm({ ...form, adminStatus: e.target.value as AdminCourseStatus })
            }
          >
            {ADMIN_COURSE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AdminNativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Mô tả</label>
          <AdminTextarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Mô tả ngắn về nội dung khóa học..."
          />
        </div>
      </div>
    </AdminModal>
  )
}
