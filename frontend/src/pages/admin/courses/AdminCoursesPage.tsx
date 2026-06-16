import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { coursesApi } from '@/api/courses.api'
import { categoriesApi } from '@/api/categories.api'
import {
  AdminBadge,
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
import { useAuth } from '@/auth/auth.context'
import { getErrorMessage } from '@/lib/errors'
import { notify } from '@/lib/notify'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import type { Course } from '@/types/course'
import { COURSE_STATUS_OPTIONS } from '@/types/course'

export function AdminCoursesPage() {
  const { confirm, ConfirmDialogHost } = useConfirmDialog()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Course | null>(null)

  const query = useQuery({
    queryKey: ['courses', 'admin-list'],
    queryFn: () => coursesApi.list({ page: 0, size: 100 }),
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.deleteByTeacher(id),
    onSuccess: () => {
      notify.success('Xóa khóa học thành công')
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const items = query.data?.content ?? []

  return (
    <div>
      <AdminPageHeader
        title="Khóa học"
        description="Tạo, chỉnh sửa và quản lý trạng thái xuất bản khóa học."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm khóa học
          </Button>
        }
      />

      <AdminCard>
        <AdminTableWrap>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Tiêu đề</AdminTh>
                <AdminTh>Slug</AdminTh>
                <AdminTh>Danh mục</AdminTh>
                <AdminTh>Trạng thái</AdminTh>
                <AdminTh align="right">Thao tác</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {query.isLoading ? (
                <AdminEmptyRow colSpan={5} message="Đang tải..." />
              ) : items.length === 0 ? (
                <AdminEmptyRow colSpan={5} message="Chưa có khóa học nào." />
              ) : (
                items.map((item) => (
                  <AdminTr key={item.id}>
                    <AdminTd className="font-semibold text-[#111827]">{item.title}</AdminTd>
                    <AdminTd className="font-mono text-xs text-[#6b7280]">{item.slug}</AdminTd>
                    <AdminTd className="text-[#6b7280]">#{item.categoryId}</AdminTd>
                    <AdminTd><AdminBadge tone="accent">{item.status}</AdminBadge></AdminTd>
                    <AdminTd align="right">
                      <div className="flex justify-end gap-0.5">
                        <AdminIconButton title="Sửa" onClick={() => setEditItem(item)}>
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton
                          title="Xóa"
                          variant="danger"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Xóa khóa học',
                              description: `Bạn có chắc muốn xóa khóa học "${item.title}"? Hành động này không thể hoàn tác.`,
                              confirmLabel: 'Xóa',
                            })
                            if (ok) deleteMutation.mutate(item.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableWrap>
      </AdminCard>

      <CourseFormModal open={createOpen} title="Thêm khóa học" onClose={() => setCreateOpen(false)} mode="create" />
      {editItem ? (
        <CourseFormModal
          open
          title={`Sửa: ${editItem.title}`}
          onClose={() => setEditItem(null)}
          mode="edit"
          initial={editItem}
        />
      ) : null}
      <ConfirmDialogHost />
    </div>
  )
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function CourseFormModal({
  open,
  title,
  onClose,
  mode,
  initial,
}: {
  open: boolean
  title: string
  onClose: () => void
  mode: 'create' | 'edit'
  initial?: Course
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list({ page: 0, size: 100 }),
  })

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    description: initial?.description ?? '',
    categoryId: initial?.categoryId ?? 0,
    status: initial?.status ?? 1,
  })
  const [slugManual, setSlugManual] = useState(mode === 'edit')

  useEffect(() => {
    if (!open) return
    setForm({
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      categoryId: initial?.categoryId ?? 0,
      status: initial?.status ?? 1,
    })
    setSlugManual(mode === 'edit')
  }, [open, mode, initial])

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : slugify(title),
    }))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManual(true)
    setForm((prev) => ({ ...prev, slug }))
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || slugify(form.title)
      if (mode === 'create') {
        return coursesApi.createByTeacher({
          title: form.title,
          slug,
          description: form.description || undefined,
          categoryId: form.categoryId,
          status: form.status,
        })
      }
      return coursesApi.updateByTeacher(initial!.id, {
        title: form.title,
        slug,
        description: form.description || undefined,
        categoryId: form.categoryId,
        status: form.status,
      })
    },
    onSuccess: () => {
      notify.success(mode === 'create' ? 'Tạo khóa học thành công' : 'Cập nhật khóa học thành công')
      void queryClient.invalidateQueries({ queryKey: ['courses'] })
      onClose()
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  })

  const categories = categoriesQuery.data?.content ?? []

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
          submitDisabled={!form.title || !form.categoryId}
        />
      }
    >
      <div className="space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
        <div>
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder={slugify(form.title) || 'tu-dong-tu-tieu-de'}
          />
          {!slugManual && form.title ? (
            <p className="mt-1 text-xs text-[#999]">
              Tự động tạo từ tiêu đề — bạn vẫn có thể sửa slug trực tiếp.
            </p>
          ) : slugManual ? (
            <button
              type="button"
              className="mt-1 text-xs font-medium text-[#f05123] hover:underline"
              onClick={() => {
                setSlugManual(false)
                setForm((prev) => ({ ...prev, slug: slugify(prev.title) }))
              }}
            >
              Đồng bộ lại từ tiêu đề
            </button>
          ) : null}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Danh mục</label>
          <AdminNativeSelect
            value={form.categoryId || ''}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </AdminNativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Trạng thái</label>
          <AdminNativeSelect
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
          >
            {COURSE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </AdminNativeSelect>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">Mô tả</label>
          <AdminTextarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        {user ? (
          <p className="text-xs text-[#9ca3af]">Giảng viên: {user.fullName ?? user.username}</p>
        ) : null}
      </div>
    </AdminModal>
  )
}
